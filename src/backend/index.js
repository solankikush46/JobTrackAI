const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");

// Load environment variables from .env file

dotenv.config();

const app = express();

// Middleware

app.use(cors());
app.use(express.json());
;
// Health check route
app.get("/api/health", (req,res) => {
    res.json({
        status: "ok",
        service: "JobTrack AI backend",
        timestamp: new Date().toISOString(),
    });
});

// Port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`JobTrack AI backend running on http://localhost:${PORT}`);
});

