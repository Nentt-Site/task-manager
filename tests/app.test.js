
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../app.js';

test('GET / responds successfully', async () => {
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
});

test('GET /tasks/abc rejects an invalid task ID', async () => {
  const response = await request(app).get('/tasks/abc');

  assert.equal(response.status, 400);
});