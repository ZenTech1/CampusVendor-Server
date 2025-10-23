import express from "express";
import prisma from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../services/emailService.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function generateOTP(length = 6) {
  const charset = "1234567890";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return OTP;
}

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user registration, login, and two-factor authentication
 */

/**
 * @swagger
 * /api/auth/signUp/student:
 *   post:
 *     summary: Register a new student and send OTP to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: User already exists
 *       500:
 *         description: Failed to send OTP or internal error
 */
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

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify signup OTP and create new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp, token]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               token:
 *                 type: string
 *                 example: "jwt_token_here"
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Invalid OTP
 *       401:
 *         description: OTP expired
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user (sends OTP if 2FA is enabled)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful or OTP sent
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

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

/**
 * @swagger
 * /api/auth/verify-2fa:
 *   post:
 *     summary: Verify 2FA OTP and complete login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp, token]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               token:
 *                 type: string
 *                 example: "jwt_temp_token_here"
 *     responses:
 *       200:
 *         description: Login successful with 2FA
 *       400:
 *         description: Invalid OTP
 *       401:
 *         description: Token expired
 *       500:
 *         description: Internal server error
 */
router.post("/verify-2fa", async (req, res) => {
  const { otp, token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email } = decoded;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (otp !== user.OTP)
      return res.status(400).json({ message: "Invalid OTP" });

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

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Enable two-factor authentication for user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA enabled
 *       500:
 *         description: Failed to enable 2FA
 */
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

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable two-factor authentication for user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled
 *       500:
 *         description: Failed to disable 2FA
 */
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
