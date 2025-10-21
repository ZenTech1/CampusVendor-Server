import express from "express";
import PrismaClient from "@prisma/client";
import bcrypt from "bcrypt";
import { verifyToken } from "./middleware/authMiddleware.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = express.Router();
const prisma = new PrismaClient()


function generateOTP(length = 6) {
  const charset = "1234567890";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return OTP;
}


router.post("/signUp/student", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ message: "User exists" });
      const OTP = generateOTP();
      
      const sendOTPEmail = await sendOTP(email, name, OTP);
      if (sendingEmail.success) {
      res.status(201).json({
        message: "OTP sent",
      });
    } else {
      res.status(201).json({
        message:
          "There was a problem sending OTP",
        credentials: { email, OTP },
      });

    const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    }
     

   
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "could not register user" });
  }
});
