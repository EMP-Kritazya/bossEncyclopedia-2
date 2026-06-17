const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

const router = express.Router();

const TEMPLATES_DIR = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "src",
  "templates",
);

const readTemplate = (file) =>
  fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");

const send404 = (res) => res.status(404).send(readTemplate("404.html"));

// Homepage — lists all bosses, or filters them when a search term is given.
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    let result;
    if (search) {
      // Matching against the boss name OR the game (case-insensitive, partial) - Stretch Feature.
      result = await pool.query(
        `SELECT * FROM bosses
         WHERE name ILIKE $1 OR game ILIKE $1
         ORDER BY name`,
        [`%${search}%`],
      );
    } else {
      result = await pool.query("SELECT * FROM bosses ORDER BY name");
    }

    const bosses = result.rows;

    const cards = bosses.length
      ? bosses
          .map(
            (boss) => `
        <article style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
            <img src="${boss.image}" alt="${boss.name}" style="width:100%; height:200px; object-fit:cover; border-radius:10px;">
            <h3>${boss.name}</h3>
            <p><strong>Game:</strong> ${boss.game}</p>
            <p><strong>Difficulty:</strong> ${boss.difficulty}</p>
            <a href="/bosses/${boss.slug}" role="button">View Details</a>
        </article>`,
          )
          .join("")
      : `<p style="color:#000; grid-column:1 / -1; text-align:center;">No bosses found matching "${search}".</p>`;

    const html = readTemplate("index.html")
      .replace("{{cards}}", cards)
      .replace(/{{search}}/g, search);

    res.send(html);
  } catch (err) {
    console.error("Error loading bosses:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Detail page for a single boss, looked up by its slug.
router.get("/bosses/:slug", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bosses WHERE slug = $1", [
      req.params.slug,
    ]);

    const boss = result.rows[0];
    if (!boss) return send404(res);

    const html = readTemplate("boss.html")
      .replace(/{{name}}/g, boss.name)
      .replace(/{{game}}/g, boss.game)
      .replace(/{{difficulty}}/g, boss.difficulty)
      .replace(/{{description}}/g, boss.description)
      .replace(/{{location}}/g, boss.location)
      .replace(/{{weakness}}/g, boss.weakness)
      .replace(/{{reward}}/g, boss.reward)
      .replace(/{{funFact}}/g, boss.fun_fact)
      .replace(/{{image}}/g, boss.image);

    res.send(html);
  } catch (err) {
    console.error("Error loading boss:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = { router, send404 };
