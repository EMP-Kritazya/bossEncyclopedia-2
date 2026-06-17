require("dotenv").config();

const express = require("express");
const path = require("path");
const { router: bossesRouter, send404 } = require("./routes/bosses");

const app = express();

const CLIENT_DIR = path.join(__dirname, "..", "client", "src");

// Serve frontend static assets (boss images live under /images).
app.use("/images", express.static(path.join(CLIENT_DIR, "assets", "images")));

const PORT = process.env.PORT || 3000;

// Live reload helper for local development convenience.
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

// Application routes (homepage, search, boss detail).
app.use("/", bossesRouter);

// Catch-all 404 for any unmatched route.
app.use((req, res) => send404(res));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
