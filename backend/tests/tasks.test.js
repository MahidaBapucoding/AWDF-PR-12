const request = require('supertest');
const app = require('../server');

// Mock dependencies so tests run fast and offline in CI without requiring an active MongoDB instance
jest.mock('../models/Task', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([
      { _id: '1', title: 'Sample Task', completed: false }
    ])
  })
}));

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

describe('Task Management CI/CD Test Suite', () => {
  // Test root API endpoint
  test('GET / returns 200 and running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task Manager API is running');
  });

  // Practical 12 requirement: GET /tasks endpoint returns status 200
  test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
  });
});
