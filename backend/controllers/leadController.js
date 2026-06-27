const db = require('../models/db');
const { calculateScore } = require('./scoringEngine');

// Validation helper functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  const re = /^\d{10}$/;
  return re.test(String(phone));
}

function validateLinkedIn(url) {
  const cleaned = String(url).trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');
  return cleaned.startsWith('linkedin.com/in/');
}

/**
 * Start a new Lead session
 */
async function startLead(req, res) {
  const { user_type } = req.body;
  if (!user_type || !['founder', 'investor'].includes(user_type)) {
    return res.status(400).json({ error: "Invalid user_type. Must be 'founder' or 'investor'." });
  }

  try {
    const result = await db.query(
      `INSERT INTO leads (user_type, status, created_at, updated_at) 
       VALUES ($1, 'new', NOW(), NOW()) 
       RETURNING id`,
      [user_type]
    );
    res.status(201).json({ session_id: result.rows[0].id });
  } catch (error) {
    console.error('Error starting lead session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Save an answer with validation
 */
async function saveAnswer(req, res) {
  const { session_id, key, value, extra } = req.body;

  if (!session_id || !key) {
    return res.status(400).json({ error: 'session_id and key are required.' });
  }

  // 1. Fetch current lead
  let leadResult;
  try {
    leadResult = await db.query('SELECT * FROM leads WHERE id = $1', [session_id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead session not found.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Database error fetching session.' });
  }

  const lead = leadResult.rows[0];

  // 2. Perform Real-time Validations
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    if (key === 'email') {
      if (!validateEmail(value)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
    } else if (key === 'phone') {
      if (!validatePhone(value)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
      }
    } else if (key === 'linkedin_url') {
      if (!validateLinkedIn(value)) {
        return res.status(400).json({ error: 'LinkedIn profile URL must start with linkedin.com/in/.' });
      }
    } else if (key === 'funding_ask' || key === 'cheque_size') {
      if (isNaN(parseFloat(value))) {
        return res.status(400).json({ error: 'Amount must be a valid number.' });
      }
    } else if (key === 'mrr') {
      if (isNaN(parseFloat(value))) {
        return res.status(400).json({ error: 'MRR must be a valid number.' });
      }
    }
  }

  try {
    // 3. Update session_answers JSONB
    const updatedAnswers = { ...lead.session_answers, [key]: value };
    
    // If there is extra info like currency, store it as well
    if (extra && extra.currency) {
      updatedAnswers[`${key}_currency`] = extra.currency;
    }

    // 4. Update the DB
    let queryText = 'UPDATE leads SET session_answers = $1, updated_at = NOW()';
    const params = [updatedAnswers];

    // Mirror core details to leads table if they exist for fast access and filtering
    let paramIndex = 2;
    const updateFields = [];

    if (key === 'full_name') {
      updateFields.push(`full_name = $${paramIndex++}`);
      params.push(value);
    } else if (key === 'email') {
      updateFields.push(`email = $${paramIndex++}`);
      params.push(value);
    } else if (key === 'phone') {
      updateFields.push(`phone = $${paramIndex++}`);
      params.push(value);
    } else if (key === 'linkedin_url') {
      updateFields.push(`linkedin_url = $${paramIndex++}`);
      params.push(value);
    }

    if (updateFields.length > 0) {
      queryText += ', ' + updateFields.join(', ');
    }

    queryText += ` WHERE id = $${paramIndex}`;
    params.push(session_id);

    await db.query(queryText, params);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    // Handle unique email constraint if someone tries to re-submit an existing email
    if (error.code === '23505') {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    res.status(500).json({ error: 'Internal server error saving answer.' });
  }
}

/**
 * Submit final answers, score lead, create subtable profile, trigger emails
 */
async function submitLead(req, res) {
  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current lead
    const leadResult = await client.query('SELECT * FROM leads WHERE id = $1', [session_id]);
    if (leadResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead session not found.' });
    }

    const lead = leadResult.rows[0];
    const answers = lead.session_answers || {};

    // Check if key information is filled
    const fullName = lead.full_name || answers.full_name;
    const email = lead.email || answers.email;
    const phone = lead.phone || answers.phone;
    const linkedinUrl = lead.linkedin_url || answers.linkedin_url;

    if (!fullName || !email) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Incomplete contact details. Full Name and Email are required.' });
    }

    // 2. Run Scoring Engine
    const { totalScore, bucket, breakdown } = calculateScore(lead.user_type, answers);

    // Determine final status
    const status = bucket === 'low' ? 'rejected' : 'new';

    // 3. Update main lead row
    await client.query(
      `UPDATE leads 
       SET full_name = $1, email = $2, phone = $3, linkedin_url = $4,
           qualification_score = $5, score_bucket = $6, status = $7, updated_at = NOW()
       WHERE id = $8`,
      [fullName, email, phone, linkedinUrl, totalScore, bucket, status, session_id]
    );

    // 4. Save Score Breakdown
    await client.query(
      `INSERT INTO score_breakdown (lead_id, score_components, total_score, calculated_at)
       VALUES ($1, $2, $3, NOW())`,
      [session_id, breakdown, totalScore]
    );

    // 5. Populate detail tables
    if (lead.user_type === 'founder') {
      const customerCount = answers.customer_count ? parseInt(answers.customer_count, 10) : null;
      const mrr = answers.mrr ? parseFloat(answers.mrr) : null;
      const coFounderCount = answers.co_founder_count ? parseInt(answers.co_founder_count, 10) : 0;
      const fundingAsk = answers.funding_ask ? parseFloat(answers.funding_ask) : 0;

      await client.query(
        `INSERT INTO founder_details (
          lead_id, startup_name, sector, problem_statement, solution, mvp_status,
          has_paying_customers, customer_count, mrr, traction_metric, co_founder_count,
          team_background, funding_ask, funding_stage, previous_funding, previous_funding_details,
          validation_types, pitch_statement
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          session_id,
          answers.startup_name || '',
          answers.sector || 'Other',
          answers.problem_statement || '',
          answers.solution || '',
          answers.mvp_status || 'idea',
          answers.has_paying_customers === true || String(answers.has_paying_customers).toLowerCase() === 'true',
          customerCount,
          mrr,
          answers.traction_metric || '',
          coFounderCount,
          answers.team_background || '',
          fundingAsk,
          answers.funding_stage || 'pre-seed',
          answers.previous_funding === true || String(answers.previous_funding).toLowerCase() === 'true',
          answers.previous_funding_details || null,
          answers.validation_types || [],
          answers.pitch_statement || ''
        ]
      );
    } else if (lead.user_type === 'investor') {
      const chequeSize = answers.cheque_size ? parseFloat(answers.cheque_size) : 0;
      const dealsLast2Years = answers.deals_last_2_years ? parseInt(answers.deals_last_2_years, 10) : 0;
      const targetDeals6Months = answers.target_deals_6_months ? parseInt(answers.target_deals_6_months, 10) : 0;

      await client.query(
        `INSERT INTO investor_details (
          lead_id, fund_name, sectors, stage_focus, investment_thesis, cheque_size,
          deals_last_2_years, portfolio_companies, round_preference, support_types,
          involvement_level, active_deployment, target_deals_6_months, venturizer_interest
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          session_id,
          answers.fund_name || '',
          answers.sectors || [],
          answers.stage_focus || '',
          answers.investment_thesis || '',
          chequeSize,
          dealsLast2Years,
          answers.portfolio_companies || null,
          answers.round_preference || 'both',
          answers.support_types || [],
          answers.involvement_level || '',
          answers.active_deployment || '',
          targetDeals6Months,
          answers.venturizer_interest || ''
        ]
      );
    }

    // 6. Generate simulated emails
    if (bucket === 'hot') {
      const orgName = lead.user_type === 'founder' ? (answers.startup_name || 'Startup') : (answers.fund_name || 'Fund');
      const subject = `🔥 HOT Lead Qualified: ${fullName} (${orgName})`;
      const body = `Hi Venturizer Team,

A new HOT lead has been qualified on the website with a score of ${totalScore}/100.

Lead details:
- Name: ${fullName}
- Email: ${email}
- Phone: ${phone}
- LinkedIn: ${linkedinUrl}
- Profile: ${lead.user_type.toUpperCase()}

Please log in to the ERP Dashboard to review their full submission and coordinate immediate outreach.

Best,
Venturizer System`;

      await client.query(
        `INSERT INTO simulated_emails (lead_id, to_address, subject, body, sent_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [session_id, 'team@venturizer.co', subject, body]
      );
    } else if (bucket === 'low') {
      const subject = `Thank you for your interest in Venturizer`;
      const body = `Dear ${fullName},

Thank you for sharing details about your profile with Venturizer.

After reviewing your submission, we regret to inform you that we are unable to proceed with your application for our program at this time. We receive a high volume of inbound inquiries and focus on profiles that align closely with our current cohort criteria.

We will keep your details on file and reach out if there are future opportunities that fit your profile. We wish you the very best on your journey.

Best regards,
The Venturizer Team`;

      await client.query(
        `INSERT INTO simulated_emails (lead_id, to_address, subject, body, sent_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [session_id, email, subject, body]
      );
    }

    await client.query('COMMIT');

    // Emit Socket Event for real-time dashboard updates
    if (req.io) {
      req.io.emit('new-lead', {
        id: session_id,
        user_type: lead.user_type,
        full_name: fullName,
        email: email,
        qualification_score: totalScore,
        score_bucket: bucket,
        status: status,
        created_at: new Date()
      });
    }

    res.status(200).json({
      success: true,
      score: totalScore,
      bucket
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting lead:', error);
    res.status(500).json({ error: 'Internal server error submitting lead.' });
  } finally {
    client.release();
  }
}

module.exports = {
  startLead,
  saveAnswer,
  submitLead
};
