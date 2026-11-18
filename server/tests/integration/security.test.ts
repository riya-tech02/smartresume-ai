process.env.MONGOMS_PACKAGE_JSON = '/Users/riyashukla/SmartResume-AI/package.json';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../../src/app.js';
import { PrintTokenService } from '../../src/modules/pdf/printToken.js';

let mongod: MongoMemoryServer;
let app: ReturnType<typeof createApp>;

describe('Security & Authorization Tests', () => {
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

  let tokenUserA = '';
  let tokenUserB = '';
  let userAResumeId = '';

  it('Setup: Register User A and User B', async () => {
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User A', email: 'user.a@example.com', password: 'Password123!' });
    tokenUserA = resA.body.data.accessToken;

    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User B', email: 'user.b@example.com', password: 'Password123!' });
    tokenUserB = resB.body.data.accessToken;

    // Create a resume for User A
    const resResume = await request(app)
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({ title: "User A's Confidential Resume", templateId: 'minimal-ats', useSample: false });
    userAResumeId = resResume.body.data.id;
  });

  it('IDOR: User B cannot GET User A resume -> returns 404 (not 403, no leakage)', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/${userAResumeId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('IDOR: User B cannot PATCH User A resume -> returns 404', async () => {
    const res = await request(app)
      .patch(`/api/v1/resumes/${userAResumeId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ baseRevision: 1, title: 'Hacked Title' });

    expect(res.status).toBe(404);
  });

  it('IDOR: User B cannot DELETE User A resume -> returns 404', async () => {
    const res = await request(app)
      .delete(`/api/v1/resumes/${userAResumeId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
  });

  it('Authentication: Rejects requests with malformed or forged JWT', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer forged.invalid.token');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('Print Token: Single-use enforcement (second attempt with same token fails)', () => {
    const token = PrintTokenService.signToken('user_test', 'resume_test');

    const first = PrintTokenService.verifyAndConsumeToken(token);
    expect(first.userId).toBe('user_test');

    expect(() => {
      PrintTokenService.verifyAndConsumeToken(token);
    }).toThrow();
  });
});
