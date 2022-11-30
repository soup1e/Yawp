const { Review } = require('../models/Review.js');

module.exports = async (req, res, next) => {
  try {
    const reviews = await Review.getReviewId(req.params.id);

    if (
      reviews &&
      (req.user.email === 'admin' || req.user.id === reviews.user_id)
    ) {
      next();
    } else {
      throw new Error('You do not have access to view this page');
    }
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
