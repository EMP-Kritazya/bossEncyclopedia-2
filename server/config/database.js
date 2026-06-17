const pg = require("pg");

require("dotenv").config();

// Connection pool to the Render PostgreSQL database.
// Render requires SSL for external connections; rejectUnauthorized is set to
// false because Render uses self-signed certificates on its managed databases.
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new pg.Pool(config);

module.exports = pool;
