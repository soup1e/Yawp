const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Restaurant = require('../models/restaurant.js');
const UserService = require('../services/UserService');

module.exports = Router().get('/', async (req, res, next) => {
  try {
    const restaurants = await Restaurant.getRestaurants();
    res.json(restaurants);
  } catch (e) {
    next(e);
  }
});
