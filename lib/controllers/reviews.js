const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const deleteauth = require('../middleware/deleteauth');
const { Review } = require('../models/Review.js');

module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const reviews = await Review.getReviewId(req.params.id);
      res.json(reviews);
    } catch (e) {
      next(e);
    }
  })
  .get('/', async (req, res, next) => {
    try {
      const reviews = await Review.getAll();
      res.json(reviews);
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', [authenticate, deleteauth], async (req, res, next) => {
    try {
      const data = await Review.delete(req.params.id);
      if (!data) next();
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });
