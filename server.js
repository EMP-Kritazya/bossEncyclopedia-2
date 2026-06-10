const fs = require("fs");
const bosses = require("./data/bosses");

require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// including live reload - for convinence
app.use((req, res, next) => {
  res.locals.liveReload = `
    <script>
      setInterval(() => {
        fetch(window.location.href).then(r => r.text()).then(html => {
          if(html !== document.documentElement.outerHTML) location.reload();
        });
      }, 1000);
    </script>
  `;
  next();
});

app.get("/", (req, res) => {
  const template = fs.readFileSync("./templates/index.html", "utf-8");

  const cards = bosses
    .map((boss) => {
      return `
        <article style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">

            <img src="${boss.image}" alt="${boss.name}" style="width:100%; height:200px; object-fit:cover; border-radius:10px;">

            <h3>${boss.name}</h3>

            <p><strong>Game:</strong> ${boss.game}</p>

            <p><strong>Difficulty:</strong> ${boss.difficulty}</p>

            <a href="/bosses/${boss.slug}" role="button">View Details</a>

        </article>
        `;
    })
    .join("");

  const html = template.replace("{{cards}}", cards) + res.locals.liveReload;

  res.send(html);
});

app.get("/bosses/:slug", (req, res) => {
  const boss = bosses.find((b) => b.slug === req.params.slug);

  if (!boss) {
    const template = fs.readFileSync("./templates/404.html", "utf-8");
    return res.status(404).send(template);
  }

  const template = fs.readFileSync("./templates/boss.html", "utf-8");

  let html = template
    .replace(/{{name}}/g, boss.name)
    .replace(/{{game}}/g, boss.game)
    .replace(/{{difficulty}}/g, boss.difficulty)
    .replace(/{{description}}/g, boss.description)
    .replace(/{{location}}/g, boss.location)
    .replace(/{{weakness}}/g, boss.weakness)
    .replace(/{{reward}}/g, boss.reward)
    .replace(/{{funFact}}/g, boss.funFact)
    .replace(/{{image}}/g, boss.image);

  res.send(html);
});

app.use((req, res) => {
  const template = fs.readFileSync("./templates/404.html", "utf-8");

  res.status(404).send(template);
});

// Starting the Server ...
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
