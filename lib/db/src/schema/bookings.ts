import { pgTable, serial, text, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  maxConcurrentBookings: integer("max_concurrent_bookings").notNull().default(2),
  bufferMinutes: integer("buffer_minutes").notNull().default(30),
  adminPinHash: text("admin_pin_hash").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettingsTable).omit({ id: true });
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof adminSettingsTable.$inferSelect;

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  price: real("price"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true, createdAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  petName: text("pet_name").notNull(),
  petType: text("pet_type").notNull(),
  serviceId: integer("service_id"),
  service: text("service").notNull(),
  serviceDurationMinutes: integer("service_duration_minutes").notNull().default(60),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
