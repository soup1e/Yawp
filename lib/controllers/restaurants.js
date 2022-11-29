const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Restaurant = require('../models/Restaurant.js');
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
  });
