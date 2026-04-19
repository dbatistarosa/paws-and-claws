import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/auth.js";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const services = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.active, true))
      .orderBy(asc(servicesTable.sortOrder), asc(servicesTable.id));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all", requireAdmin, async (_req, res) => {
  try {
    const services = await db
      .select()
      .from(servicesTable)
      .orderBy(asc(servicesTable.sortOrder), asc(servicesTable.id));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, durationMinutes, price, active, sortOrder } = req.body as {
      name?: string;
      durationMinutes?: number;
      price?: number;
      active?: boolean;
      sortOrder?: number;
    };
    if (!name || !durationMinutes) {
      res.status(400).json({ error: "name and durationMinutes are required" });
      return;
    }
    const [service] = await db
      .insert(servicesTable)
      .values({
        name,
        durationMinutes,
        price: price ?? null,
        active: active ?? true,
        sortOrder: sortOrder ?? 0,
      })
      .returning();
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { name, durationMinutes, price, active, sortOrder } = req.body as {
      name?: string;
      durationMinutes?: number;
      price?: number | null;
      active?: boolean;
      sortOrder?: number;
    };
    const update: Partial<typeof servicesTable.$inferInsert> = {};
    if (name !== undefined) update.name = name;
    if (durationMinutes !== undefined) update.durationMinutes = durationMinutes;
    if (price !== undefined) update.price = price;
    if (active !== undefined) update.active = active;
    if (sortOrder !== undefined) update.sortOrder = sortOrder;
    const [updated] = await db
      .update(servicesTable)
      .set(update)
      .where(eq(servicesTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [deleted] = await db
      .delete(servicesTable)
      .where(eq(servicesTable.id, id))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
