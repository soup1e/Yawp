const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('blog routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('GET api/v1/restaurant should return list of restaurant', async () => {
    const res = await request(app).get('/api/v1/restaurant/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
    Array [
      Object {},
    ]`);
  });
});
