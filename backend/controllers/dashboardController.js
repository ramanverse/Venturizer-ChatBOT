const db = require('../models/db');

/**
 * Get all leads with dynamic filters
 */
async function getLeads(req, res) {
  const { user_type, score_bucket, status, sector, date_range } = req.query;

  let queryText = `
    SELECT l.*, 
           fd.startup_name, fd.sector as founder_sector,
           id.fund_name, id.sectors as investor_sectors
    FROM leads l
    LEFT JOIN founder_details fd ON l.id = fd.lead_id
    LEFT JOIN investor_details id ON l.id = id.lead_id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (user_type) {
    queryText += ` AND l.user_type = $${paramIndex++}`;
    params.push(user_type);
  }

  if (score_bucket) {
    queryText += ` AND l.score_bucket = $${paramIndex++}`;
    params.push(score_bucket);
  }

  if (status) {
    queryText += ` AND l.status = $${paramIndex++}`;
    params.push(status);
  }

  if (sector) {
    queryText += ` AND (fd.sector = $${paramIndex} OR $${paramIndex} = ANY(id.sectors))`;
    params.push(sector);
    paramIndex++;
  }

  if (date_range) {
    if (date_range === 'today') {
      queryText += " AND l.created_at >= NOW() - INTERVAL '1 day'";
    } else if (date_range === 'week') {
      queryText += " AND l.created_at >= NOW() - INTERVAL '7 days'";
    } else if (date_range === 'month') {
      queryText += " AND l.created_at >= NOW() - INTERVAL '30 days'";
    }
  }

  queryText += ' ORDER BY l.created_at DESC';

  try {
    const result = await db.query(queryText, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get full profile of a single lead
 */
async function getLeadById(req, res) {
  const { id } = req.params;

  try {
    const leadResult = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const lead = leadResult.rows[0];
    let details = null;

    if (lead.user_type === 'founder') {
      const detailsResult = await db.query('SELECT * FROM founder_details WHERE lead_id = $1', [id]);
      details = detailsResult.rows[0] || null;
    } else {
      const detailsResult = await db.query('SELECT * FROM investor_details WHERE lead_id = $1', [id]);
      details = detailsResult.rows[0] || null;
    }

    const scoreResult = await db.query('SELECT * FROM score_breakdown WHERE lead_id = $1', [id]);
    const scoreBreakdown = scoreResult.rows[0] || null;

    const emailsResult = await db.query('SELECT * FROM simulated_emails WHERE lead_id = $1 ORDER BY sent_at DESC', [id]);
    const emails = emailsResult.rows;

    res.status(200).json({
      ...lead,
      details,
      scoreBreakdown,
      emails
    });
  } catch (error) {
    console.error('Error fetching lead profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update lead status or notes
 */
async function updateLead(req, res) {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    // Check if lead exists
    const checkLead = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (checkLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (status !== undefined) {
      if (!['new', 'contacted', 'rejected', 'enrolled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }
      fields.push(`status = $${idx++}`);
      params.push(status);
    }

    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      params.push(notes);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    params.push(id);
    const queryText = `
      UPDATE leads 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx} 
      RETURNING *
    `;

    const result = await db.query(queryText, params);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get dashboard stats summary
 */
async function getStats(req, res) {
  const { date_range } = req.query;
  let dateFilter = '';

  if (date_range === 'today') {
    dateFilter = " AND created_at >= NOW() - INTERVAL '1 day'";
  } else if (date_range === 'week') {
    dateFilter = " AND created_at >= NOW() - INTERVAL '7 days'";
  } else if (date_range === 'month') {
    dateFilter = " AND created_at >= NOW() - INTERVAL '30 days'";
  }

  try {
    // Current month leads count
    const totalMonthRes = await db.query(
      `SELECT COUNT(*) FROM leads WHERE created_at >= DATE_TRUNC('month', NOW())`
    );
    
    // Overall stats with dateFilter
    const totalRes = await db.query(`SELECT COUNT(*) FROM leads WHERE 1=1 ${dateFilter}`);
    const hotRes = await db.query(`SELECT COUNT(*) FROM leads WHERE score_bucket = 'hot' ${dateFilter}`);
    const goodRes = await db.query(`SELECT COUNT(*) FROM leads WHERE score_bucket = 'good' ${dateFilter}`);
    const maybeRes = await db.query(`SELECT COUNT(*) FROM leads WHERE score_bucket = 'maybe' ${dateFilter}`);
    const lowRes = await db.query(`SELECT COUNT(*) FROM leads WHERE score_bucket = 'low' ${dateFilter}`);
    
    const foundersRes = await db.query(`SELECT COUNT(*) FROM leads WHERE user_type = 'founder' ${dateFilter}`);
    const investorsRes = await db.query(`SELECT COUNT(*) FROM leads WHERE user_type = 'investor' ${dateFilter}`);

    res.status(200).json({
      totalThisMonth: parseInt(totalMonthRes.rows[0].count, 10),
      total: parseInt(totalRes.rows[0].count, 10),
      hot: parseInt(hotRes.rows[0].count, 10),
      good: parseInt(goodRes.rows[0].count, 10),
      maybe: parseInt(maybeRes.rows[0].count, 10),
      low: parseInt(lowRes.rows[0].count, 10),
      founders: parseInt(foundersRes.rows[0].count, 10),
      investors: parseInt(investorsRes.rows[0].count, 10)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Export filtered leads as CSV
 */
async function exportLeadsCSV(req, res) {
  const { user_type, score_bucket, status, sector } = req.query;

  let queryText = `
    SELECT l.id, l.user_type, l.full_name, l.email, l.phone, l.linkedin_url, 
           l.qualification_score, l.score_bucket, l.status, l.created_at,
           fd.startup_name, fd.sector as founder_sector, fd.mvp_status, fd.mrr,
           id.fund_name, id.cheque_size
    FROM leads l
    LEFT JOIN founder_details fd ON l.id = fd.lead_id
    LEFT JOIN investor_details id ON l.id = id.lead_id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (user_type) {
    queryText += ` AND l.user_type = $${paramIndex++}`;
    params.push(user_type);
  }

  if (score_bucket) {
    queryText += ` AND l.score_bucket = $${paramIndex++}`;
    params.push(score_bucket);
  }

  if (status) {
    queryText += ` AND l.status = $${paramIndex++}`;
    params.push(status);
  }

  if (sector) {
    queryText += ` AND (fd.sector = $${paramIndex} OR $${paramIndex} = ANY(id.sectors))`;
    params.push(sector);
    paramIndex++;
  }

  queryText += ' ORDER BY l.created_at DESC';

  try {
    const result = await db.query(queryText, params);
    
    // Construct CSV
    const headers = [
      'ID', 'User Type', 'Full Name', 'Email', 'Phone', 'LinkedIn URL',
      'Score', 'Bucket', 'Status', 'Date Created',
      'Startup/Fund Name', 'Sector', 'MVP/Focus Stage', 'MRR/Cheque Size'
    ];

    const rows = result.rows.map(lead => {
      const orgName = lead.user_type === 'founder' ? lead.startup_name : lead.fund_name;
      const sectorVal = lead.user_type === 'founder' ? lead.founder_sector : '';
      const stageVal = lead.user_type === 'founder' ? lead.mvp_status : '';
      const amountVal = lead.user_type === 'founder' ? lead.mrr : lead.cheque_size;

      return [
        lead.id,
        lead.user_type,
        `"${(lead.full_name || '').replace(/"/g, '""')}"`,
        lead.email,
        lead.phone || '',
        lead.linkedin_url || '',
        lead.qualification_score || 0,
        lead.score_bucket || '',
        lead.status || '',
        lead.created_at.toISOString(),
        `"${(orgName || '').replace(/"/g, '""')}"`,
        `"${(sectorVal || '').replace(/"/g, '""')}"`,
        `"${(stageVal || '').replace(/"/g, '""')}"`,
        amountVal || ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=venturizer_leads.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all simulated emails (for ERP log)
 */
async function getSimulatedEmails(req, res) {
  try {
    const result = await db.query(`
      SELECT se.*, l.full_name, l.user_type 
      FROM simulated_emails se
      JOIN leads l ON se.lead_id = l.id
      ORDER BY se.sent_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching simulated emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getLeads,
  getLeadById,
  updateLead,
  getStats,
  exportLeadsCSV,
  getSimulatedEmails
};
