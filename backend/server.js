const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

let users = [];

app.post("/api/signup", (req, res) => {
  const { username, email, password } = req.body;

  console.log("📥 Signup Request Received:");
  console.log("Username:", username);
  console.log("Email:", email);

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    console.log("❌ Signup failed: User already exists");
    return res.status(409).json({ status: "error", message: "User already exists" });
  }

  users.push({ username, email, password });

  console.log("✅ Signup successful\n");
  res.json({ status: "success" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("📥 Login Request Received:");
  console.log("Email:", email);

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    console.log("❌ Login failed: Invalid credentials\n");
    return res.status(401).json({ status: "error", message: "Invalid credentials" });
  }

  console.log("✅ Login successful for:", user.username, "\n");
  res.json({ status: "success" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

