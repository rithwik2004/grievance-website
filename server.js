const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_KEY = "secretkey123"; // Store securely in production
const USER = { username: "csudha", password: "iloveyou" };

app.use(express.static("public"));
app.use(express.json());

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "2h" });
    return res.status(200).json({ token });
  }
  res.status(401).send("Unauthorized");
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Complaint submission route
app.post("/complaint", authenticateToken, (req, res) => {
  const complaint = req.body.complaint;
  const timestamp = new Date().toISOString();
  const entry = { complaint, timestamp };

  fs.readFile("complaints.json", (err, data) => {
    let complaints = [];
    if (!err && data.length > 0) {
      try {
        complaints = JSON.parse(data);
      } catch (e) {
        return res.status(500).send("Error parsing complaints.");
      }
    }
    complaints.push(entry);
    fs.writeFile("complaints.json", JSON.stringify(complaints, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving complaint.");
      res.send("Complaint saved!");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
