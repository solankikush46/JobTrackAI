const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Root route for sanity check
app.get("/", (req, res) => {
  res.send("JobTrack AI backend is running.");
});

// Auth routes mounted at /api/auth
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "JobTrack AI backend",
    timestamp: new Date().toISOString(),
  });
});

// Protected route
app.get("/api/protected/test", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`JobTrack AI backend running on http://localhost:${PORT}`);
});
