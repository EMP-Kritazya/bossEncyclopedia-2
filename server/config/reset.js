const pool = require("./database");
const bosses = require("./data");

// Create a table schema
const createBossesTable = async () => {
  const createTableQuery = `
    DROP TABLE IF EXISTS bosses;

    CREATE TABLE bosses (
      id          SERIAL PRIMARY KEY,
      slug        VARCHAR(255) UNIQUE NOT NULL,
      name        VARCHAR(255) NOT NULL,
      game        VARCHAR(255) NOT NULL,
      difficulty  VARCHAR(50),
      description TEXT,
      location    VARCHAR(255),
      weakness    TEXT,
      reward      TEXT,
      fun_fact    TEXT,
      image       VARCHAR(255)
    );
  `;

  await pool.query(createTableQuery);
};

// Inserts every boss from data.js into the table.
const seedBossesTable = async () => {
  await createBossesTable();

  for (const boss of bosses) {
    const insertQuery = {
      text: `
        INSERT INTO bosses (slug, name, game, difficulty, description, location, weakness, reward, fun_fact, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      values: [
        boss.slug,
        boss.name,
        boss.game,
        boss.difficulty,
        boss.description,
        boss.location,
        boss.weakness,
        boss.reward,
        boss.funFact,
        boss.image,
      ],
    };

    await pool.query(insertQuery);
  }

  await pool.end();
};

seedBossesTable();
