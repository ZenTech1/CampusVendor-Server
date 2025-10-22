import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../services/emailService.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Generate OTP
function generateOTP(length = 6) {
  const charset = "1234567890";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return OTP;
}

// ===================== SIGN UP =====================
router.post("/signUp/student", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const sent = await sendOTP(name, email, otp);
    if (!sent.success) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    const signupToken = jwt.sign(
      { name, email, password: hashedPassword, otp },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.status(200).json({
      message: "OTP sent to email. Verify to complete signup.",
      token: signupToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during signup" });
  }
});

// ===================== VERIFY OTP =====================
router.post("/verify-otp", async (req, res) => {
  const { otp, token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, email, password, otp: storedOtp } = decoded;

    if (otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const newUser = await prisma.user.create({
      data: { name, email, password, OTP: otp },
    });

    res.status(201).json({
      message: "Signup complete",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "OTP expired. Please sign up again." });
    }
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    // If user has 2FA enabled → send OTP before login
    if (user.twoFA) {
      const otp = generateOTP();
      await prisma.user.update({ where: { email }, data: { OTP: otp } });

      const sent = await sendOTP(user.name, email, otp);
      if (!sent.success) {
        return res.status(500).json({ message: "Failed to send 2FA OTP" });
      }

      const tempToken = jwt.sign({ id: user.id, email }, JWT_SECRET, {
        expiresIn: "5m",
      });
      return res.status(200).json({
        message: "2FA OTP sent. Verify to complete login.",
        token: tempToken,
      });
    }

    // If 2FA is off → proceed to login directly
    const authToken = jwt.sign({ id: user.id, email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token: authToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

// ===================== VERIFY 2FA OTP =====================
router.post("/verify-2fa", async (req, res) => {
  const { otp, token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email } = decoded;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (otp !== user.OTP)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP is valid → complete login
    const authToken = jwt.sign({ id: user.id, email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    await prisma.user.update({ where: { email }, data: { OTP: null } });

    res.status(200).json({
      message: "2FA login successful",
      token: authToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "OTP expired. Please log in again." });
    }
    console.error(error);
    res.status(500).json({ message: "Error verifying 2FA OTP" });
  }
});

// ===================== TOGGLE 2FA =====================
router.post("/2fa/enable", verifyToken, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFA: true },
    });

    res.status(200).json({
      message: "2FA has been enabled.",
      status: updated.twoFA,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to enable 2FA" });
  }
});

router.post("/2fa/disable", verifyToken, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFA: false },
    });

    res.status(200).json({
      message: "2FA has been disabled.",
      status: updated.twoFA,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
});

export default router;
