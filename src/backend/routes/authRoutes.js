const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  createUser,
  findUserByUsername,
  findUserByEmail,
  verifyUser,
  deleteUser,
} = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");

console.log("authRoutes file loaded");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Simple test route: GET /api/auth/test
router.get("/test", (req, res) => {
  console.log("HIT /api/auth/test");
  res.json({ message: "auth test route is working" });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  console.log("HIT /api/auth/register", req.body);

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    const existingByUsername = await findUserByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await createUser({ username, email, passwordHash, verificationToken });

    // MOCK EMAIL SENDING
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
    console.log("==================================================");
    console.log(`[MOCK EMAIL] Verification Link for ${email}:`);
    console.log(verificationLink);
    console.log("==================================================");

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  console.log("HIT /api/auth/verify-email", req.body);
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const success = await verifyUser(token);
    if (!success) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  console.log("HIT /api/auth/login", req.body);

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/auth/delete-account
router.delete("/delete-account", authMiddleware, async (req, res) => {
  console.log("HIT /api/auth/delete-account", req.user);
  try {
    const success = await deleteUser(req.user.id);
    if (!success) {
      return res.status(400).json({ message: "Failed to delete account" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
