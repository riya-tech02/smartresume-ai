process.env.MONGOMS_PACKAGE_JSON = '/Users/riyashukla/SmartResume-AI/package.json';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../../src/app.js';
import { removeLegacyUsernameIndex } from '../../src/config/db.js';

let mongod: MongoMemoryServer;
let app: ReturnType<typeof createApp>;

describe('Auth & Resumes API Integration Tests', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    app = createApp();
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  let accessToken = '';
  let sampleResumeId = '';
  let createdResumeId = '';

  it('GET /api/v1/health returns ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('removes the obsolete unique username index so new users can register', async () => {
    const users = mongoose.connection.collection('users');
    await users.insertOne({ _id: new mongoose.Types.ObjectId() });
    await users.createIndex({ username: 1 }, { unique: true });

    await removeLegacyUsernameIndex();

    const indexes = await users.indexes();
    expect(indexes.some((index) => index.unique && index.key.username === 1)).toBe(false);
  });

  it('POST /api/v1/auth/register creates user, sample resume, and sets refresh cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Neha Sharma',
        email: 'neha.sharma@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('neha.sharma@example.com');
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('sr_refresh='))).toBe(true);
  });

  it('POST /api/v1/auth/register returns 409 for duplicate email (case-insensitive)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another Neha',
        email: 'NEHA.SHARMA@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('POST /api/v1/auth/login succeeds with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'neha.sharma@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  it('POST /api/v1/auth/login returns 401 on invalid password without user enumeration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'neha.sharma@example.com',
        password: 'WrongPassword999',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/v1/resumes lists resumes including the auto-created sample resume', async () => {
    const res = await request(app)
      .get('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`);

    if (res.status !== 200) {
      console.error('GET /resumes error body:', JSON.stringify(res.body));
    }
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const sample = res.body.data.find((r: any) => r.isSample === true);
    expect(sample).toBeDefined();
    expect(sample.title).toContain('Sample');
    sampleResumeId = sample.id;
  });

  it('POST /api/v1/ai/suggest requires consent and returns suggestions in the API data envelope', async () => {
    const status = await request(app)
      .get('/api/v1/ai/status')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(status.status).toBe(200);
    expect(status.body.data.consentAccepted).toBe(false);

    const withoutConsent = await request(app)
      .post('/api/v1/ai/suggest')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        feature: 'summary',
        resumeId: sampleResumeId,
        payload: { headline: 'Software Engineer' },
      });
    expect(withoutConsent.status).toBe(403);

    const consent = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ aiConsentAccepted: true });
    expect(consent.status).toBe(200);
    expect(consent.body.data.user.preferences.aiConsentAcceptedAt).toBeTruthy();

    const suggestion = await request(app)
      .post('/api/v1/ai/suggest')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        feature: 'summary',
        resumeId: sampleResumeId,
        payload: { headline: 'Software Engineer', currentSummary: 'Builds reliable software.' },
      });
    expect(suggestion.status).toBe(200);
    expect(suggestion.body.data.suggestions.length).toBeGreaterThan(0);
    expect(suggestion.body.data.meta.provider).toBe('mock');
  });

  it('POST /api/v1/resumes creates a new blank resume', async () => {
    const res = await request(app)
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Frontend Engineer Resume',
        templateId: 'minimal-ats',
        useSample: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Frontend Engineer Resume');
    expect(res.body.data.revision).toBe(1);
    createdResumeId = res.body.data.id;
  });

  it('PATCH /api/v1/resumes/:id updates resume with optimistic concurrency', async () => {
    const res = await request(app)
      .patch(`/api/v1/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        baseRevision: 1,
        title: 'Updated Frontend Resume',
        personalInfo: {
          fullName: 'Neha Sharma',
          headline: 'Lead Frontend Developer',
          email: 'neha.sharma@example.com',
          phone: '+91 99999 88888',
          location: 'Delhi, India',
          links: [],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.revision).toBe(2);
    expect(res.body.data.completion).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/resumes/:id returns 409 CONFLICT_REVISION for stale revision', async () => {
    const res = await request(app)
      .patch(`/api/v1/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        baseRevision: 1, // Stale! Revision is already 2
        title: 'Conflicting Edit',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT_REVISION');
  });

  it('POST /api/v1/resumes/:id/ats runs ATS analysis and returns score and checks', async () => {
    const res = await request(app)
      .post(`/api/v1/resumes/${sampleResumeId}/ats`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.overall).toBeGreaterThanOrEqual(70);
    expect(res.body.data.checks.length).toBeGreaterThan(0);
    expect(res.body.data.disclaimer).toBeDefined();
  });

  it('DELETE /api/v1/resumes/:id deletes resume and cascades analyses', async () => {
    const res = await request(app)
      .delete(`/api/v1/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getRes.status).toBe(404);
  });
});
