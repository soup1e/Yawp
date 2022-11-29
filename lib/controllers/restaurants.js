const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Restaurant = require('../models/Restaurant.js');
const { Review } = require('../models/Review.js');
const UserService = require('../services/UserService');

module.exports = Router()
  .get('/', async (req, res, next) => {
    try {
      const restaurants = await Restaurant.getRestaurants();
      res.json(restaurants);
    } catch (e) {
      next(e);
    }
  })
  .get('/:id', async (req, res, next) => {
    try {
      const singleRestaurant = await Restaurant.getRestaurant(req.params.id);
      await singleRestaurant.getReviews();
      res.json(singleRestaurant);
    } catch (e) {
      next(e);
    }
  })
  .post('/:id/reviews', authenticate, async (req, res, next) => {
    console.log('balls');

    console.log(req.params.id);
    try {
      const review = await Review.insert({
        restaurantId: req.params.id,
        userId: req.user.id,
        stars: req.body.stars,
        detail: req.body.detail,
      });
      res.json(review);
    } catch (e) {
      next(e);
    }
  });
