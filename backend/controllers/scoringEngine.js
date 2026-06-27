/**
 * Scoring Engine for Venturizer Lead Qualification
 */

/**
 * Normalize currency values to INR
 * @param {number} value 
 * @param {string} currency 'INR' or 'USD'
 * @returns {number} normalized value in INR
 */
function normalizeToINR(value, currency) {
  const numValue = parseFloat(value) || 0;
  if (currency && currency.toUpperCase() === 'USD') {
    return numValue * 83; // 1 USD = 83 INR
  }
  return numValue;
}

/**
 * Calculates score and determines bucket for a founder lead
 * @param {object} answers 
 * @returns {object} score details
 */
function scoreFounder(answers) {
  const breakdown = {};
  let totalScore = 0;

  // 1. MVP Status (Max 25)
  const mvp = answers.mvp_status || '';
  let mvpScore = 3; // default idea stage
  if (mvp === 'revenue') mvpScore = 25;
  else if (mvp === 'beta') mvpScore = 18;
  else if (mvp === 'prototype') mvpScore = 10;
  else if (mvp === 'idea') mvpScore = 3;
  breakdown.mvpStatus = mvpScore;
  totalScore += mvpScore;

  // 2. Traction - Has paying customers (Max 15)
  const hasCustomers = answers.has_paying_customers === true || String(answers.has_paying_customers).toLowerCase() === 'true';
  const tractionScore = hasCustomers ? 15 : 0;
  breakdown.traction = tractionScore;
  totalScore += tractionScore;

  // 3. MRR Bonus (Max 10)
  let mrrScore = 0;
  if (hasCustomers) {
    const mrrVal = parseFloat(answers.mrr) || 0;
    const mrrINR = normalizeToINR(mrrVal, answers.mrr_currency || 'INR');
    if (mrrINR > 100000) {
      mrrScore = 10;
    } else if (mrrINR >= 10000) {
      mrrScore = 5;
    }
  }
  breakdown.mrrBonus = mrrScore;
  totalScore += mrrScore;

  // 4. Team (Max 10)
  const coFounders = parseInt(answers.co_founder_count, 10);
  let teamScore = 5; // default solo
  if (!isNaN(coFounders) && coFounders >= 2) {
    teamScore = 10;
  }
  breakdown.team = teamScore;
  totalScore += teamScore;

  // 5. Validation (Max 15)
  const validation = Array.isArray(answers.validation_types) ? answers.validation_types : [];
  let validationScore = 0;
  const hasLOIorPilot = validation.some(v => v === 'LOIs' || v === 'Pilot agreements');
  const hasAwardsOrMedia = validation.some(v => v === 'Media coverage' || v === 'Awards/recognition');
  
  if (hasLOIorPilot) {
    validationScore = 15;
  } else if (hasAwardsOrMedia) {
    validationScore = 8;
  }
  breakdown.validation = validationScore;
  totalScore += validationScore;

  // 6. Funding Stage (Max 5)
  const stage = answers.funding_stage || '';
  let stageScore = 3; // default pre-seed
  if (stage === 'series-a') stageScore = 5;
  else if (stage === 'seed') stageScore = 4;
  else if (stage === 'pre-seed') stageScore = 3;
  breakdown.fundingStage = stageScore;
  totalScore += stageScore;

  // 7. Background Text Quality (Max 20)
  // Fields: problem_statement, solution, team_background, pitch_statement
  const checkTextScore = (text) => {
    const val = String(text || '').trim();
    return val.length > 100 ? 5 : 2;
  };

  const probScore = checkTextScore(answers.problem_statement);
  const solScore = checkTextScore(answers.solution);
  const teamBgScore = checkTextScore(answers.team_background);
  const pitchScore = checkTextScore(answers.pitch_statement);

  const textQualityScore = probScore + solScore + teamBgScore + pitchScore;
  breakdown.backgroundTextQuality = textQualityScore;
  breakdown.textFields = {
    problemStatement: probScore,
    solution: solScore,
    teamBackground: teamBgScore,
    pitchStatement: pitchScore
  };
  totalScore += textQualityScore;

  return { totalScore, breakdown };
}

/**
 * Calculates score and determines bucket for an investor lead
 * @param {object} answers 
 * @returns {object} score details
 */
function scoreInvestor(answers) {
  const breakdown = {};
  let totalScore = 0;

  // 1. Stage Focus (Max 20)
  const stageFocus = answers.stage_focus || '';
  let stageScore = 8; // default late stage/other
  if (stageFocus === 'pre-seed' || stageFocus === 'seed') {
    stageScore = 20;
  } else if (stageFocus === 'all-stages') {
    stageScore = 15;
  } else if (stageFocus === 'series-a' || stageFocus === 'series-b-plus') {
    stageScore = 8;
  }
  breakdown.stageFocus = stageScore;
  totalScore += stageScore;

  // 2. Cheque Size (Max 25)
  const chequeSizeVal = parseFloat(answers.cheque_size) || 0;
  const chequeSizeINR = normalizeToINR(chequeSizeVal, answers.cheque_currency || 'INR');
  let chequeScore = 8; // default below 10L
  if (chequeSizeINR > 5000000) {
    chequeScore = 25;
  } else if (chequeSizeINR >= 1000000) {
    chequeScore = 15;
  }
  breakdown.chequeSize = chequeScore;
  totalScore += chequeScore;

  // 3. Active Deployment (Max 20)
  const deployment = answers.active_deployment || '';
  let deploymentScore = 3; // default no
  if (deployment === 'yes') {
    deploymentScore = 20;
  } else if (deployment === 'planning-soon') {
    deploymentScore = 10;
  } else if (deployment === 'no') {
    deploymentScore = 3;
  }
  breakdown.activeDeployment = deploymentScore;
  totalScore += deploymentScore;

  // 4. Deal Volume (last 2 years) (Max 15)
  const deals = parseInt(answers.deals_last_2_years, 10);
  let dealsScore = 3; // default 0-1 deals
  if (!isNaN(deals)) {
    if (deals >= 5) {
      dealsScore = 15;
    } else if (deals >= 2) {
      dealsScore = 8;
    }
  }
  breakdown.dealVolume = dealsScore;
  totalScore += dealsScore;

  // 5. Support Value (Max 10)
  const support = Array.isArray(answers.support_types) ? answers.support_types : [];
  // Exclude 'None' from support count if selected
  const activeSupportCount = support.filter(s => s !== 'None').length;
  let supportScore = 0;
  if (activeSupportCount >= 3) {
    supportScore = 10;
  } else if (activeSupportCount >= 1) {
    supportScore = 5;
  }
  breakdown.supportValue = supportScore;
  totalScore += supportScore;

  // 6. Thesis/Interest Text Quality (Max 10)
  // Fields: investment_thesis, venturizer_interest
  const checkTextScore = (text) => {
    const val = String(text || '').trim();
    return val.length > 100 ? 5 : 2;
  };

  const thesisScore = checkTextScore(answers.investment_thesis);
  const interestScore = checkTextScore(answers.venturizer_interest);
  
  const textQualityScore = thesisScore + interestScore;
  breakdown.thesisInterestTextQuality = textQualityScore;
  breakdown.textFields = {
    investmentThesis: thesisScore,
    venturizerInterest: interestScore
  };
  totalScore += textQualityScore;

  return { totalScore, breakdown };
}

/**
 * Determine score bucket and dashboard tag
 * @param {number} score 
 * @returns {string} 'hot' | 'good' | 'maybe' | 'low'
 */
function getScoreBucket(score) {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'good';
  if (score >= 40) return 'maybe';
  return 'low';
}

/**
 * Main function to calculate score
 * @param {string} userType 'founder' or 'investor'
 * @param {object} answers 
 * @returns {object} calculation results
 */
function calculateScore(userType, answers) {
  if (!userType || !answers) {
    throw new Error('User type and answers are required.');
  }

  let result;
  if (userType === 'founder') {
    result = scoreFounder(answers);
  } else if (userType === 'investor') {
    result = scoreInvestor(answers);
  } else {
    throw new Error(`Invalid user type: ${userType}`);
  }

  const bucket = getScoreBucket(result.totalScore);
  
  return {
    totalScore: result.totalScore,
    bucket,
    breakdown: result.breakdown
  };
}

module.exports = {
  calculateScore,
  normalizeToINR
};
