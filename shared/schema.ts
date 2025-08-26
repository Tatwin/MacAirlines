import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['customer', 'employee']);
export const ticketStatusEnum = pgEnum('ticket_status', ['confirmed', 'checked_in', 'cancelled', 'completed']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'refunded']);
export const seatClassEnum = pgEnum('seat_class', ['economy', 'premium', 'business', 'first']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flights = pgTable("flights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flightNumber: text("flight_number").notNull().unique(),
  airline: text("airline").notNull(),
  aircraft: text("aircraft").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  gate: text("gate"),
  status: text("status").notNull().default('scheduled'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passengers = pgTable("passengers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  nationality: text("nationality"),
  passportNumber: text("passport_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  flightId: varchar("flight_id").references(() => flights.id).notNull(),
  passengerId: varchar("passenger_id").references(() => passengers.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  seatNumber: text("seat_number").notNull(),
  seatClass: seatClassEnum("seat_class").notNull().default('economy'),
  bookingReference: text("booking_reference").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: ticketStatusEnum("status").notNull().default('confirmed'),
  checkedIn: boolean("checked_in").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionNumber: text("transaction_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ticketId: varchar("ticket_id").references(() => tickets.id),
  bookingReference: text("booking_reference").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: transactionStatusEnum("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const seats = pgTable("seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flightId: varchar("flight_id").references(() => flights.id).notNull(),
  seatNumber: text("seat_number").notNull(),
  seatClass: seatClassEnum("seat_class").notNull(),
  isAvailable: boolean("is_available").default(true),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  passengers: many(passengers),
  tickets: many(tickets),
  transactions: many(transactions),
}));

export const flightsRelations = relations(flights, ({ many }) => ({
  tickets: many(tickets),
  seats: many(seats),
}));

export const passengersRelations = relations(passengers, ({ one, many }) => ({
  user: one(users, { fields: [passengers.userId], references: [users.id] }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  flight: one(flights, { fields: [tickets.flightId], references: [flights.id] }),
  passenger: one(passengers, { fields: [tickets.passengerId], references: [passengers.id] }),
  user: one(users, { fields: [tickets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  ticket: one(tickets, { fields: [transactions.ticketId], references: [tickets.id] }),
}));

export const seatsRelations = relations(seats, ({ one }) => ({
  flight: one(flights, { fields: [seats.flightId], references: [flights.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
  createdAt: true,
});

export const insertPassengerSchema = createInsertSchema(passengers).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertSeatSchema = createInsertSchema(seats).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertSeat = z.infer<typeof insertSeatSchema>;

export type User = typeof users.$inferSelect;
export type Flight = typeof flights.$inferSelect;
export type Passenger = typeof passengers.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Seat = typeof seats.$inferSelect;

// Auth schemas
export const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['customer', 'employee']),
});

export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
