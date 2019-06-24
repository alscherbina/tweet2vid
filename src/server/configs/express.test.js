const request = require('supertest');
const app = require('./express');
const logger = require('./logger');

jest.mock('./logger', () => {
  return {
    info: jest.fn(() => 42)
  };
});

describe('Routes tests', () => {
  test('GET / returns 200 Ok', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  test('GET /api/videos returns 200 Ok with list of media', async () => {
    const response = await request(app).get('/api/videos');
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(
      expect.objectContaining({
        media: expect.any(Array)
      })
    );
  });

  test('POST /api/videos/task fails if no twitterPostURL param sent in body', async () => {
    const response = await request(app).post('/api/videos/task');
    expect(response.statusCode).not.toBe(200);
  });
});
