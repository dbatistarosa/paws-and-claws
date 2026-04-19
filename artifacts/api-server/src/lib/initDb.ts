import { db } from "@workspace/db";
import { adminSettingsTable, servicesTable } from "@workspace/db/schema";
import bcrypt from "bcryptjs";

const DEFAULT_SERVICES = [
  { name: "Full Grooming (Bath + Trim)", durationMinutes: 90, price: null, sortOrder: 0 },
  { name: "Bath Only", durationMinutes: 60, price: null, sortOrder: 1 },
  { name: "Nail Trim", durationMinutes: 30, price: null, sortOrder: 2 },
  { name: "Brush Out", durationMinutes: 45, price: null, sortOrder: 3 },
  { name: "Skin Care Treatment", durationMinutes: 60, price: null, sortOrder: 4 },
  { name: "Boarding (Overnight)", durationMinutes: 30, price: null, sortOrder: 5 },
];

export async function initDb(): Promise<void> {
  const existing = await db.query.adminSettingsTable.findFirst();
  if (!existing) {
    const hash = await bcrypt.hash("admin1234", 10);
    await db.insert(adminSettingsTable).values({
      maxConcurrentBookings: 2,
      bufferMinutes: 30,
      adminPinHash: hash,
    });
    console.log("Admin settings initialized (default PIN: admin1234)");
  }

  const existingServices = await db.query.servicesTable.findFirst();
  if (!existingServices) {
    await db.insert(servicesTable).values(DEFAULT_SERVICES);
    console.log("Default services seeded");
  }
}
