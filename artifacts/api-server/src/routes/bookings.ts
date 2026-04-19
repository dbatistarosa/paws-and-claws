import { Router } from "express";
import { db } from "@workspace/db";
import { adminSettingsTable, bookingsTable, servicesTable } from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/auth.js";
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function isBusinessDay(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day >= 2 && day <= 6;
}

router.get("/availability", async (req, res) => {
  try {
    const { date, durationMinutes: durStr } = req.query as { date?: string; durationMinutes?: string };
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Invalid or missing date parameter (YYYY-MM-DD)" });
      return;
    }
    if (!isBusinessDay(date)) {
      res.json({ date, slots: [] });
      return;
    }

    const settings = await db.query.adminSettingsTable.findFirst();
    const maxConcurrent = settings?.maxConcurrentBookings ?? 2;
    const bufferMinutes = settings?.bufferMinutes ?? 30;
    const slotDuration = durStr ? parseInt(durStr) : 60;

    const openMinutes = 8 * 60;
    const closeMinutes = 15 * 60;
    const slots: string[] = [];
    for (let m = openMinutes; m + slotDuration <= closeMinutes; m += 30) {
      slots.push(minutesToTime(m));
    }

    const existingBookings = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.appointmentDate, date),
          inArray(bookingsTable.status, ["pending", "confirmed"])
        )
      );

    const availableSlots = slots.filter((slot) => {
      const slotMin = timeToMinutes(slot);
      let concurrentCount = 0;
      let hasNearby = false;
      for (const booking of existingBookings) {
        const bookingMin = timeToMinutes(booking.appointmentTime);
        const bookingDuration = booking.serviceDurationMinutes ?? 60;
        if (bookingMin === slotMin) {
          concurrentCount++;
        } else {
          const slotEnd = slotMin + slotDuration;
          const bookingEnd = bookingMin + bookingDuration;
          const gapAfterBooking = slotMin - bookingEnd;
          const gapAfterSlot = bookingMin - slotEnd;
          if (
            (gapAfterBooking >= 0 && gapAfterBooking < bufferMinutes) ||
            (gapAfterSlot >= 0 && gapAfterSlot < bufferMinutes) ||
            (slotMin < bookingEnd && slotEnd > bookingMin)
          ) {
            hasNearby = true;
          }
        }
      }
      return concurrentCount < maxConcurrent && !hasNearby;
    });

    res.json({ date, slots: availableSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      customerName, customerEmail, customerPhone,
      petName, petType,
      serviceId, service, serviceDurationMinutes,
      appointmentDate, appointmentTime, notes,
    } = req.body as {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      petName?: string;
      petType?: string;
      serviceId?: number;
      service?: string;
      serviceDurationMinutes?: number;
      appointmentDate?: string;
      appointmentTime?: string;
      notes?: string;
    };

    if (!customerName || !customerPhone || !petName || !petType || !service || !appointmentDate || !appointmentTime) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    let resolvedDuration = serviceDurationMinutes ?? 60;
    if (serviceId && !serviceDurationMinutes) {
      const svc = await db.query.servicesTable.findFirst({ where: eq(servicesTable.id, serviceId) });
      if (svc) resolvedDuration = svc.durationMinutes;
    }

    const [booking] = await db
      .insert(bookingsTable)
      .values({
        customerName,
        customerEmail: customerEmail ?? null,
        customerPhone,
        petName,
        petType,
        serviceId: serviceId ?? null,
        service,
        serviceDurationMinutes: resolvedDuration,
        appointmentDate,
        appointmentTime,
        status: "pending",
        notes: notes ?? null,
      })
      .returning();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { date, status } = req.query as { date?: string; status?: string };
    const conditions = [];
    if (date) conditions.push(eq(bookingsTable.appointmentDate, date));
    if (status) conditions.push(eq(bookingsTable.status, status));
    const bookings = conditions.length
      ? await db.select().from(bookingsTable).where(and(...conditions))
      : await db.select().from(bookingsTable);
    res.json(
      bookings.sort((a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) ||
        a.appointmentTime.localeCompare(b.appointmentTime)
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const booking = await db.query.bookingsTable.findFirst({ where: eq(bookingsTable.id, id) });
    if (!booking) { res.status(404).json({ error: "Not found" }); return; }
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { status, notes } = req.body as { status?: string; notes?: string };
    const update: Partial<typeof bookingsTable.$inferInsert> = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    const [updated] = await db.update(bookingsTable).set(update).where(eq(bookingsTable.id, id)).returning();
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
    const [deleted] = await db.delete(bookingsTable).where(eq(bookingsTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/ics", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const booking = await db.query.bookingsTable.findFirst({ where: eq(bookingsTable.id, id) });
    if (!booking) { res.status(404).json({ error: "Not found" }); return; }
    const duration = booking.serviceDurationMinutes ?? 60;
    const [year, month, day] = booking.appointmentDate.split("-").map(Number);
    const [hour, minute] = booking.appointmentTime.split(":").map(Number);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dtStart = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
    const endMin = hour * 60 + minute + duration;
    const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(Math.floor(endMin / 60))}${pad(endMin % 60)}00`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Paws and Claws//EN",
      "BEGIN:VEVENT",
      `UID:booking-${booking.id}@pawsandclaws.com`,
      `DTSTART;TZID=America/New_York:${dtStart}`,
      `DTEND;TZID=America/New_York:${dtEnd}`,
      `SUMMARY:${booking.service} - ${booking.petName} (${booking.customerName})`,
      `DESCRIPTION:Customer: ${booking.customerName}\\nPhone: ${booking.customerPhone}${booking.customerEmail ? "\\nEmail: " + booking.customerEmail : ""}\\nPet: ${booking.petName} (${booking.petType})\\nService: ${booking.service}${booking.notes ? "\\nNotes: " + booking.notes : ""}`,
      "LOCATION:3846 Blanding Blvd\\, Jacksonville\\, FL 32210",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="booking-${booking.id}.ics"`);
    res.send(ics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
