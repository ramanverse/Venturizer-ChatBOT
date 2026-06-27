const request = require('supertest');
const app = require('../server');
const db = require('../models/db');

describe('Venturizer Chatbot API Integration Tests', () => {
  let sessionId;
  let adminToken;

  afterAll(async () => {
    // Cleanup the database created session
    if (sessionId) {
      await db.query('DELETE FROM leads WHERE id = $1', [sessionId]);
    }
    await db.pool.end();
  });

  describe('Chatbot Lead Flow', () => {
    test('POST /api/leads/start should initialize a founder session', async () => {
      const res = await request(app)
        .post('/api/leads/start')
        .send({ user_type: 'founder' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('session_id');
      sessionId = res.body.session_id;
    });

    test('POST /api/leads/answer should save answers and apply validation', async () => {
      // 1. Invalid Email validation
      let res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'email', value: 'invalid-email' });
      expect(res.statusCode).toBe(400);

      // 2. Valid Email
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'email', value: 'founder@test.com' });
      expect(res.statusCode).toBe(200);

      // 3. Valid Full Name
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'full_name', value: 'Test Founder' });
      expect(res.statusCode).toBe(200);

      // 4. Invalid Phone
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'phone', value: '12345' });
      expect(res.statusCode).toBe(400);

      // 5. Valid Phone
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'phone', value: '9876543210' });
      expect(res.statusCode).toBe(200);

      // 6. Valid LinkedIn
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'linkedin_url', value: 'https://linkedin.com/in/test-founder' });
      expect(res.statusCode).toBe(200);

      // 7. Startup background
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'startup_name', value: 'V-Tech' });
      expect(res.statusCode).toBe(200);

      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'mvp_status', value: 'revenue' });
      expect(res.statusCode).toBe(200);
      
      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'has_paying_customers', value: true });
      expect(res.statusCode).toBe(200);

      res = await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'mrr', value: 2000, extra: { currency: 'USD' } });
      expect(res.statusCode).toBe(200);
    });

    test('POST /api/leads/submit should run scoring and return results', async () => {
      // Add missing fields for scoring validation
      await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'co_founder_count', value: 2 });

      await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'problem_statement', value: 'This is a long problem statement description to satisfy text length verification requirements.' });

      await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'solution', value: 'This is a long solution statement description to satisfy text length verification requirements.' });

      await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'team_background', value: 'This is a long team background statement description to satisfy text length verification requirements.' });

      await request(app)
        .post('/api/leads/answer')
        .send({ session_id: sessionId, key: 'pitch_statement', value: 'This is a long pitch statement description to satisfy text length verification requirements.' });

      const res = await request(app)
        .post('/api/leads/submit')
        .send({ session_id: sessionId });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('bucket');
    });
  });

  describe('Dashboard Operations', () => {
    test('POST /api/dashboard/login should return a JWT token', async () => {
      const res = await request(app)
        .post('/api/dashboard/login')
        .send({ email: 'admin@venturizer.co', password: 'adminpassword' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      adminToken = res.body.token;
    });

    test('GET /api/dashboard/stats should be protected and return KPIs', async () => {
      // 1. Unauthenticated request
      let res = await request(app).get('/api/dashboard/stats');
      expect(res.statusCode).toBe(401);

      // 2. Authenticated request
      res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('total');
    });

    test('GET /api/dashboard/leads should return lead list', async () => {
      const res = await request(app)
        .get('/api/dashboard/leads')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('GET /api/dashboard/leads/:id should return full profile details', async () => {
      const res = await request(app)
        .get(`/api/dashboard/leads/${sessionId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('details');
      expect(res.body).toHaveProperty('scoreBreakdown');
    });

    test('PATCH /api/dashboard/leads/:id/status should update notes', async () => {
      const res = await request(app)
        .patch(`/api/dashboard/leads/${sessionId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Interviews scheduled next Wednesday' });
      expect(res.statusCode).toBe(200);
      expect(res.body.notes).toBe('Interviews scheduled next Wednesday');
    });
  });
});
