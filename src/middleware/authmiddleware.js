import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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