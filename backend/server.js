const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK (ADD HERE)
========================= */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   PostgreSQL Connection
========================= */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ PostgreSQL error:", err));

/* =========================
   Create table if not exists
========================= */
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100)
  )
`);

/* =========================
   Signup API
========================= */
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, password]
    );

    res.json({ status: "success", message: "Signup successful" });
  } catch (err) {
    res.status(409).json({ status: "error", message: "User already exists" });
  }
});

/* =========================
   Login API
========================= */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ status: "error", message: "Invalid credentials" });
  }

  res.json({ status: "success", message: "Login successful" });
});

/* =========================
   Start server
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
