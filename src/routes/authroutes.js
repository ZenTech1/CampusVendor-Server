import express from "express";
import prisma from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../services/emailService.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Helper: Generate numeric OTP
function generateOTP(length = 6) {
  const digits = "1234567890";
  return Array.from(
    { length },
    () => digits[Math.floor(Math.random() * 10)]
  ).join("");
}

// ============================================================
// ================= STUDENT SIGNUP & VERIFICATION =============
// ============================================================

router.post("/signUp/student", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const sent = await sendOTP(name, email, otp);
    if (!sent.success)
      return res.status(500).json({ message: "Failed to send OTP" });

    const signupToken = jwt.sign(
      { name, email, password: hashedPassword, otp },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      message: "OTP sent to email. Verify to complete signup.",
      token: signupToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error during signup" });
  }
});

router.post("/verify-otp/student", async (req, res) => {
  const { otp, token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (otp !== decoded.otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const user = await prisma.user.create({
      data: {
        name: decoded.name,
        email: decoded.email,
        password: decoded.password,
        role: decoded.role,
        OTP_verified: true,
      },
    });
    res.status(201).json({ message: "Student signup complete", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
    console.error(error);
  }
});

// ============================================================
// ====================== VENDOR SIGNUP ========================
// ============================================================

router.post("/signUp/vendor", async (req, res) => {
  const { name, email, password, entName, phone, location, description } =
    req.body;

  try {
    const existingVendor = await prisma.vendor.findUnique({ where: { email } });
    if (existingVendor)
      return res.status(400).json({ message: "Vendor already exists" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const sent = await sendOTP(name, email, otp);
    if (!sent.success)
      return res.status(500).json({ message: "Failed to send OTP" });

    const signupToken = jwt.sign(
      {
        name,
        email,
        password: hashedPassword,
        entName,
        phone,
        location,
        description,
        otp,
      },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      message: "OTP sent to email. Verify to complete signup.",
      token: signupToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error during vendor signup" });
    console.error(error);
  }
});

router.post("/verify-otp/vendor", async (req, res) => {
  const { otp, token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (otp !== decoded.otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const vendor = await prisma.vendor.create({
      data: {
        name: decoded.name,
        email: decoded.email,
        password: decoded.password,
        entName: decoded.entName,
        description: decoded.description,
        phone: decoded.phone,
        location: decoded.location,
        OTP_verified: true,
      },
    });

    res.status(201).json({ message: "Vendor signup complete", vendor });
  } catch (error) {
    res.status(500).json({ message: "Error verifying vendor OTP" });
    console.error(error);
  }
});

// ============================================================
// ================== UNIFIED LOGIN (USER+VENDOR) ==============
// ============================================================

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let accountType = "USER";
    let account = await prisma.user.findUnique({ where: { email } });

    if (!account) {
      account = await prisma.vendor.findUnique({ where: { email } });
      if (account) accountType = "VENDOR";
    }

    if (!account) return res.status(404).json({ message: "Account not found" });

    const validPassword = await bcrypt.compare(password, account.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    if (account.twoFA) {
      const otp = generateOTP();
      if (accountType === "USER") {
        await prisma.user.update({ where: { email }, data: { OTP: otp } });
      } else {
        await prisma.vendor.update({ where: { email }, data: { OTP: otp } });
      }

      const sent = await sendOTP(account.name, email, otp);
      if (!sent.success)
        return res.status(500).json({ message: "Failed to send 2FA OTP" });

      const tempToken = jwt.sign({ email, accountType }, JWT_SECRET, {
        expiresIn: "5m",
      });
      return res.status(200).json({
        message: "2FA OTP sent. Verify to complete login.",
        token: tempToken,
      });
    }

    const token = jwt.sign(
      { id: account.id, email, type: accountType },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(accountType === "USER" ? 200 : 201).json({
      message: `${accountType} login successful`,
      token,
      account,
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
});

// ============================================================
// ===================== VERIFY 2FA OTP ========================
// ============================================================

router.post("/verify-2fa", async (req, res) => {
  const { otp, token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email, accountType } = decoded;

    const account =
      accountType === "USER"
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.vendor.findUnique({ where: { email } });

    if (!account) return res.status(404).json({ message: "Account not found" });
    if (otp !== account.OTP)
      return res.status(400).json({ message: "Invalid OTP" });

    const authToken = jwt.sign(
      { id: account.id, email, type: accountType },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // clear OTP
    if (accountType === "USER")
      await prisma.user.update({ where: { email }, data: { OTP: null } });
    else await prisma.vendor.update({ where: { email }, data: { OTP: null } });

    res.status(200).json({
      message: "2FA login successful",
      token: authToken,
      account,
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying 2FA OTP" });
  }
});

// ============================================================
// ==================== ENABLE/DISABLE 2FA =====================
// ============================================================

router.post("/2fa/enable", verifyToken, async (req, res) => {
  try {
    const { id, type } = req.user;
    if (type === "USER") {
      await prisma.user.update({ where: { id }, data: { twoFA: true } });
    } else {
      await prisma.vendor.update({ where: { id }, data: { twoFA: true } });
    }
    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to enable 2FA" });
  }
});

router.post("/2fa/disable", verifyToken, async (req, res) => {
  try {
    const { id, type } = req.user;
    if (type === "USER") {
      await prisma.user.update({ where: { id }, data: { twoFA: false } });
    } else {
      await prisma.vendor.update({ where: { id }, data: { twoFA: false } });
    }
    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
});

// ============================================================
// ================= RESEND OTP + RESET PASSWORD ===============
// ============================================================

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  try {
    let account = await prisma.user.findUnique({ where: { email } });
    let accountType = "USER";
    if (!account) {
      account = await prisma.vendor.findUnique({ where: { email } });
      if (account) accountType = "VENDOR";
    }

    if (!account) return res.status(404).json({ message: "Account not found" });

    const otp = generateOTP();
    if (accountType === "USER")
      await prisma.user.update({ where: { email }, data: { OTP: otp } });
    else await prisma.vendor.update({ where: { email }, data: { OTP: otp } });

    const sent = await sendOTP(account.name, email, otp);
    if (!sent.success)
      return res.status(500).json({ message: "Failed to resend OTP" });

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    let account = await prisma.user.findUnique({ where: { email } });
    let accountType = "USER";
    if (!account) {
      account = await prisma.vendor.findUnique({ where: { email } });
      if (account) accountType = "VENDOR";
    }

    if (!account) return res.status(404).json({ message: "Account not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (accountType === "USER")
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
    else
      await prisma.vendor.update({
        where: { email },
        data: { password: hashedPassword },
      });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

export default router;
