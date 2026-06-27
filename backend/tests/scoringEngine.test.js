const { calculateScore, normalizeToINR } = require('../controllers/scoringEngine');

describe('Scoring Engine', () => {
  
  describe('normalizeToINR', () => {
    test('should return same value for INR', () => {
      expect(normalizeToINR(10000, 'INR')).toBe(10000);
      expect(normalizeToINR(50000, 'inr')).toBe(50000);
    });

    test('should multiply USD by 83', () => {
      expect(normalizeToINR(1000, 'USD')).toBe(83000);
      expect(normalizeToINR(5000, 'usd')).toBe(415000);
    });

    test('should default to INR if currency is missing', () => {
      expect(normalizeToINR(10000)).toBe(10000);
    });
  });

  describe('Founder Scoring', () => {
    test('should score a HOT founder lead (>80)', () => {
      const answers = {
        mvp_status: 'revenue', // 25
        has_paying_customers: true, // 15
        mrr: 1500,
        mrr_currency: 'USD', // 1500 * 83 = 124,500 > 1L so 10
        co_founder_count: 3, // 10
        validation_types: ['LOIs', 'Media coverage'], // 15
        funding_stage: 'series-a', // 5
        // Text quality: all long (>100 chars) -> 4 * 5 = 20
        problem_statement: 'A very long problem statement that exceeds one hundred characters to make sure we get maximum quality score points.',
        solution: 'A very long solution details that exceeds one hundred characters to make sure we get maximum quality score points.',
        team_background: 'A very long team background description that exceeds one hundred characters to make sure we get maximum quality score points.',
        pitch_statement: 'A very long pitch statement that exceeds one hundred characters to make sure we get maximum quality score points.'
      };

      const result = calculateScore('founder', answers);
      expect(result.totalScore).toBe(100);
      expect(result.bucket).toBe('hot');
    });

    test('should score a LOW founder lead (<40)', () => {
      const answers = {
        mvp_status: 'idea', // 3
        has_paying_customers: false, // 0
        mrr: 0, // 0
        co_founder_count: 0, // 5 (solo)
        validation_types: ['None yet'], // 0
        funding_stage: 'pre-seed', // 3
        // Text quality: all short -> 4 * 2 = 8
        problem_statement: 'Short prob.',
        solution: 'Short sol.',
        team_background: 'Short team.',
        pitch_statement: 'Short pitch.'
      };

      const result = calculateScore('founder', answers);
      // Total should be: 3 + 0 + 0 + 5 + 0 + 3 + 8 = 19
      expect(result.totalScore).toBe(19);
      expect(result.bucket).toBe('low');
    });
  });

  describe('Investor Scoring', () => {
    test('should score a HOT investor lead (>80)', () => {
      const answers = {
        stage_focus: 'seed', // 20
        cheque_size: 65000,
        cheque_currency: 'USD', // 65000 * 83 = 5,395,000 > 50L so 25
        active_deployment: 'yes', // 20
        deals_last_2_years: 6, // 15
        support_types: ['Mentorship', 'Network access', 'Hiring help'], // 3 types -> 10
        // Text quality: both long -> 2 * 5 = 10
        investment_thesis: 'A very long investment thesis statement that exceeds one hundred characters to make sure we get maximum quality score points.',
        venturizer_interest: 'A very long venturizer interest statement that exceeds one hundred characters to make sure we get maximum quality score points.'
      };

      const result = calculateScore('investor', answers);
      expect(result.totalScore).toBe(100);
      expect(result.bucket).toBe('hot');
    });

    test('should score a LOW investor lead (<40)', () => {
      const answers = {
        stage_focus: 'series-b-plus', // 8
        cheque_size: 500000, // 5L < 10L so 8
        active_deployment: 'no', // 3
        deals_last_2_years: 1, // 3
        support_types: ['None'], // 0 types -> 0
        // Text quality: both short -> 2 * 2 = 4
        investment_thesis: 'Short thesis.',
        venturizer_interest: 'Short interest.'
      };

      const result = calculateScore('investor', answers);
      // Total should be: 8 + 8 + 3 + 3 + 0 + 4 = 26
      expect(result.totalScore).toBe(26);
      expect(result.bucket).toBe('low');
    });
  });
});
