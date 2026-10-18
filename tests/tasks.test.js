const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
});

test('POST /tasks creates a task', async () => {
  const res = await request(app)
    .post('/tasks')
    .send({
      title: 'Test Task',
      description: 'Task description',
      priority: 'high',
      assignee: 'Ali'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.data.title, 'Test Task');
  assert.equal(res.body.data.priority, 'high');
});

test('GET /tasks supports filtering and pagination', async () => {
  const res = await request(app)
    .get('/tasks?status=todo&priority=high&page=1&limit=10&sortBy=createdAt&sortOrder=desc');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('GET /reports/summary returns metrics', async () => {
  const res = await request(app).get('/reports/summary');

  assert.equal(res.status, 200);
  assert.ok(res.body.data.totalTasks >= 0);
  assert.ok('completedTasks' in res.body.data);
});
