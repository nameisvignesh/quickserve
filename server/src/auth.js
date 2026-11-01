import "dotenv/config";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET || "quickserve-local-development-secret";
export const ownerEmail = String(process.env.OWNER_EMAIL || "admin2026@gmail.com").trim().toLowerCase();
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please log in to continue." });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "You do not have permission for this action." });
    next();
  };
}
export function requireOwner(req, res, next) {
  if (!req.user || req.user.role !== "admin" || req.user.email !== ownerEmail) return res.status(403).json({ message: "Only the QuickServe owner can access this area." });
  next();
}
