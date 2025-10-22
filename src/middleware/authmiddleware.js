import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../utils/prisma.js";

dotenv.config();

export function verifyToken(req, res, next) {
  const h = req.headers.authorization?.split(" ");
  if (!h || h[0] !== "Bearer" || !h[1])
    return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(h[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

export async function check2FA(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.twoFA) {
      return res
        .status(403)
        .json({ message: "2FA is disabled for this account." });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking 2FA status" });
  }
}
