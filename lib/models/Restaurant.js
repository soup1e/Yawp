const pool = require('../utils/pool');
const { Review } = require('./Review');

module.exports = class Restaurant {
  id;
  name;
  cuisine;
  cost;
  image;
  website;
  reviews;

  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.cuisine = row.cuisine;
    this.cost = row.cost;
    this.image = row.image;
    this.website = row.website;
    this.reviews = row.reviews;
  }

  static async getRestaurants() {
    const { rows } = await pool.query('SELECT * FROM restaurants');
    return rows.map((row) => new Restaurant(row));
  }

  static async getRestaurant(id) {
    const { rows } = await pool.query(
      `
    SELECT
        *
    FROM
        restaurants
    WHERE
        id = $1;
    `,
      [id]
    );
    return new Restaurant(rows[0]);
  }

  async getReviews() {
    const { rows } = await pool.query(
      `
    SELECT
        *
    FROM
        reviews
    WHERE
        restaurant_id = $1
    `,
      [this.id]
    );
    this.comments = rows.map((row) => new Review(row));
  }
};
