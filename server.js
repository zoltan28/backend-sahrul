  const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// ✅ MIDDLEWARE (WAJIB DI ATAS)
app.use(cors());
app.use(bodyParser.json());

// 🔐 CONFIG
const SECRET_KEY = "ISI_SECRET_XENDIT";
const FONNTE_KEY = "ISI_API_FONNTE";

let tokens = {};
let users = [];

// 📲 KIRIM WHATSAPP
async function kirimWA(nomor, pesan) {
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: FONNTE_KEY,
    },
    body: new URLSearchParams({
      target: nomor,
      message: pesan,
    }),
  });
}

// 💳 CREATE PAYMENT (QRIS)
app.get("/create-payment", async (req, res) => {
  try {
    const external_id = "order-" + Date.now();

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id,
        amount: 10000,
        description: "Akses Premium",
        success_redirect_url:
          "https://USERNAME.github.io/AI-sahrul/akses.html",
      }),
    });

    const data = await response.json();

    res.json({ paymentUrl: data.invoice_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat pembayaran" });
  }
});

// 🔔 WEBHOOK XENDIT
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (data.status === "PAID") {
      const token = uuidv4();
      tokens[token] = true;

      users.push({
        email: data.payer_email,
        amount: data.amount,
        token,
        date: new Date(),
      });

      await kirimWA(
        "628xxxxxxxxxx",
        `🔥 Pembayaran berhasil!

Token kamu:
${token}

Akses:
https://USERNAME.github.io/AI-sahrul/akses.html?token=${token}`
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// 🔐 VERIFY TOKEN
app.get("/verify", (req, res) => {
  const { token } = req.query;

  if (tokens[token]) {
    delete tokens[token];
    res.json({ success: true, redirect: "https://google.com" });
  } else {
    res.json({ success: false });
  }
});

// 📊 DASHBOARD
app.get("/dashboard", (req, res) => {
  res.json(users);
});

// 🚀 PORT RAILWAY (WAJIB)
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server jalan di port", PORT);
});
