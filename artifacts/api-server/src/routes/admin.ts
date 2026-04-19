import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { adminSettingsTable } from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { pin } = req.body as { pin?: string };
    if (!pin) {
      res.status(400).json({ error: "PIN is required" });
      return;
    }
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }
    const settings = await db.query.adminSettingsTable.findFirst();
    if (!settings) {
      res.status(500).json({ error: "Admin not configured" });
      return;
    }
    const valid = await bcrypt.compare(pin, settings.adminPinHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid PIN" });
      return;
    }
    const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings", requireAdmin, async (_req, res) => {
  try {
    const settings = await db.query.adminSettingsTable.findFirst();
    if (!settings) {
      res.status(404).json({ error: "Settings not found" });
      return;
    }
    const { adminPinHash: _h, ...safe } = settings;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const { maxConcurrentBookings, bufferMinutes, newPin } = req.body as {
      maxConcurrentBookings?: number;
      bufferMinutes?: number;
      newPin?: string;
    };
    const settings = await db.query.adminSettingsTable.findFirst();
    if (!settings) {
      res.status(404).json({ error: "Settings not found" });
      return;
    }
    const update: Partial<typeof adminSettingsTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (maxConcurrentBookings !== undefined) update.maxConcurrentBookings = maxConcurrentBookings;
    if (bufferMinutes !== undefined) update.bufferMinutes = bufferMinutes;
    if (newPin) {
      update.adminPinHash = await bcrypt.hash(newPin, 10);
    }
    const [updated] = await db
      .update(adminSettingsTable)
      .set(update)
      .where(eq(adminSettingsTable.id, settings.id))
      .returning();
    const { adminPinHash: _h, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
