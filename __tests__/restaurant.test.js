const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

const joe = {
  firstName: 'joe',
  lastName: 'buck',
  email: 'joebuck@tester.com',
  password: 'password',
};

const admin = {
  firstName: 'admin',
  lastName: 'admin',
  email: 'admin',
  password: 'password',
};

describe('blog routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('GET api/v1/restaurant should return list of restaurant', async () => {
    const res = await request(app).get('/api/v1/restaurants');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "cost": 1,
          "cuisine": "American",
          "id": "1",
          "image": "https://media-cdn.tripadvisor.com/media/photo-o/05/dd/53/67/an-assortment-of-donuts.jpg",
          "name": "Pip's Original",
          "website": "http://www.PipsOriginal.com",
        },
        Object {
          "cost": 3,
          "cuisine": "Italian",
          "id": "2",
          "image": "https://media-cdn.tripadvisor.com/media/photo-m/1280/13/af/df/89/duck.jpg",
          "name": "Mucca Osteria",
          "website": "http://www.muccaosteria.com",
        },
        Object {
          "cost": 2,
          "cuisine": "Mediterranean",
          "id": "3",
          "image": "https://media-cdn.tripadvisor.com/media/photo-m/1280/1c/f2/e5/0c/dinner.jpg",
          "name": "Mediterranean Exploration Company",
          "website": "http://www.mediterraneanexplorationcompany.com/",
        },
        Object {
          "cost": 2,
          "cuisine": "American",
          "id": "4",
          "image": "https://media-cdn.tripadvisor.com/media/photo-o/0d/d6/a1/06/chocolate-gooey-brownie.jpg",
          "name": "Salt & Straw",
          "website": "https://saltandstraw.com/pages/nw-23",
        },
      ]
    `);
  });

  it('GET api/v1/restaurant/1 should return a single restaurant with nested comments', async () => {
    const res = await request(app).get('/api/v1/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "cost": 1,
        "cuisine": "American",
        "id": "1",
        "image": "https://media-cdn.tripadvisor.com/media/photo-o/05/dd/53/67/an-assortment-of-donuts.jpg",
        "name": "Pip's Original",
        "reviews": Array [
          Object {
            "detail": "Best restaurant ever!",
            "id": "1",
            "restaurant_id": "1",
            "stars": 5,
            "user_id": "1",
          },
          Object {
            "detail": "Terrible service :(",
            "id": "2",
            "restaurant_id": "1",
            "stars": 1,
            "user_id": "2",
          },
          Object {
            "detail": "It was fine.",
            "id": "3",
            "restaurant_id": "1",
            "stars": 4,
            "user_id": "3",
          },
        ],
        "website": "http://www.PipsOriginal.com",
      }
    `);
  });

  const registerAndLoginJoe = async () => {
    const agent = request.agent(app);
    const user = await UserService.create(joe);
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: joe.email, password: joe.password });
    return [agent, user];
  };

  it('POST /api/v1/restaurant/:id/reviews should create a new review when logged in', async () => {
    const [agent] = await registerAndLoginJoe();
    const res = await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: 5, detail: 'It was okay' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "detail": "It was okay",
        "id": "4",
        "restaurant_id": "1",
        "stars": 5,
        "user_id": "4",
      }
    `);
  });

  const registerAndLoginAdmin = async () => {
    const agent = request.agent(app);
    const user = await UserService.create(admin);
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: admin.email, password: admin.password });
    return [agent, user];
  };

  it('DELETE /api/v1/reviews/:id should DELETE any review when admin', async () => {
    const [agent] = await registerAndLoginAdmin();
    await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: 2, detail: 'NEW REVIEW' });
    // Finds new Review
    const res = await request(app).get('/api/v1/reviews');
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "detail": "Best restaurant ever!",
          "id": "1",
          "restaurant_id": "1",
          "stars": 5,
          "user_id": "1",
        },
        Object {
          "detail": "Terrible service :(",
          "id": "2",
          "restaurant_id": "1",
          "stars": 1,
          "user_id": "2",
        },
        Object {
          "detail": "It was fine.",
          "id": "3",
          "restaurant_id": "1",
          "stars": 4,
          "user_id": "3",
        },
        Object {
          "detail": "NEW REVIEW",
          "id": "4",
          "restaurant_id": "1",
          "stars": 2,
          "user_id": "4",
        },
      ]
    `);
    // Deletes own and other reviews
    await agent.delete('/api/v1/reviews/4');
    await agent.delete('/api/v1/reviews/2');
    // Checks all Reviews
    const response = await request(app).get('/api/v1/reviews');
    expect(response.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "detail": "Best restaurant ever!",
          "id": "1",
          "restaurant_id": "1",
          "stars": 5,
          "user_id": "1",
        },
        Object {
          "detail": "It was fine.",
          "id": "3",
          "restaurant_id": "1",
          "stars": 4,
          "user_id": "3",
        },
      ]
    `);
  });

  it('DELETE /api/v1/reviews/:id should NOT DELETE others reviews', async () => {
    const [agent] = await registerAndLoginJoe();
    const resp = await agent.delete('/api/v1/reviews/2');
    expect(resp.status).toBe(403);
    const res = await request(app).get('/api/v1/reviews/');
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "detail": "Best restaurant ever!",
          "id": "1",
          "restaurant_id": "1",
          "stars": 5,
          "user_id": "1",
        },
        Object {
          "detail": "Terrible service :(",
          "id": "2",
          "restaurant_id": "1",
          "stars": 1,
          "user_id": "2",
        },
        Object {
          "detail": "It was fine.",
          "id": "3",
          "restaurant_id": "1",
          "stars": 4,
          "user_id": "3",
        },
      ]
    `);
  });

  it('DELETE /api/v1/reviews/:id should NOT DELETE a review without being logged in', async () => {
    const resp = await request(app).delete('/api/v1/reviews/2');
    expect(resp.status).toBe(401);
    const res = await request(app).get('/api/v1/reviews/');
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "detail": "Best restaurant ever!",
          "id": "1",
          "restaurant_id": "1",
          "stars": 5,
          "user_id": "1",
        },
        Object {
          "detail": "Terrible service :(",
          "id": "2",
          "restaurant_id": "1",
          "stars": 1,
          "user_id": "2",
        },
        Object {
          "detail": "It was fine.",
          "id": "3",
          "restaurant_id": "1",
          "stars": 4,
          "user_id": "3",
        },
      ]
    `);
  });

  it('DELETE /api/v1/reviews/:id should DELETE if it their own review ', async () => {
    const [agent] = await registerAndLoginJoe();
    // Post
    await agent
      .post('/api/v1/restaurants/1/reviews')
      .send({ stars: 4, detail: 'I AM JOE' });

    // Checks for review
    const res = await request(app).get('/api/v1/reviews/4');
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "detail": "I AM JOE",
        "id": "4",
        "restaurant_id": "1",
        "stars": 4,
        "user_id": "4",
      }
    `);
    // Deletes review
    await agent.delete('/api/v1/reviews/4');
    // Checks all Reviews
    const response = await request(app).get('/api/v1/reviews');
    expect(response.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "detail": "Best restaurant ever!",
          "id": "1",
          "restaurant_id": "1",
          "stars": 5,
          "user_id": "1",
        },
        Object {
          "detail": "Terrible service :(",
          "id": "2",
          "restaurant_id": "1",
          "stars": 1,
          "user_id": "2",
        },
        Object {
          "detail": "It was fine.",
          "id": "3",
          "restaurant_id": "1",
          "stars": 4,
          "user_id": "3",
        },
      ]
    `);
  });
});
