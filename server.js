const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FONNTE_KEY = "M6M1Fji8efrvraxpjiRnG939RB2";
let tokens = {};
let usedTokens = [];

function generateKode() {
  return "VIP-" + Math.floor(100000 + Math.random()*900000);
}

app.post("/generate-code", async (req, res) => {
  const { nomor } = req.body;
  if (!nomor) return res.status(400).json({ error: "Nomor WA wajib" });

  const kode = generateKode();
  tokens[kode] = true;

  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { "Authorization": FONNTE_KEY },
    body: new URLSearchParams({
      target: nomor,
      message: `Kode premium kamu: ${kode}`
    })
  });

  res.json({ success: true, kode });
});

app.get("/verify", (req, res) => {
  const { kode } = req.query;
  if (tokens[kode]) {
    delete tokens[kode];
    usedTokens.push(kode);
    res.json({ success: true, redirect: "https://opal.google/edit/1wuXkQDE_gPxDu6hQ3B0HKfastyudW4BU" });
  } else {
    res.json({ success: false });
  }
});

app.get("/dashboard", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(usedTokens, null, 2));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port", PORT);
});
