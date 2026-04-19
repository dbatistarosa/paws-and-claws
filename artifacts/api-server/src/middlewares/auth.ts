import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server configuration error" });
    return;
  }
  try {
    jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
