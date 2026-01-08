const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

/* =========================
   PostgreSQL Connection
========================= */
const pool = new Pool({
  user: "saikumar",
  host: "localhost",
  database: "saidb",
  password: "saikumar123",
  port: 5432,
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

    console.log("✅ Signup successful:", email);
    res.json({ status: "success", message: "Signup successful" });

  } catch (err) {
    console.error(err.message);
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

