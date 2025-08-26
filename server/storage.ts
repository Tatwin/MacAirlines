import {
  users, flights, passengers, tickets, transactions, seats,
  type User, type Flight, type Passenger, type Ticket, type Transaction, type Seat,
  type InsertUser, type InsertFlight, type InsertPassenger,
  type InsertTicket, type InsertTransaction, type InsertSeat
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Flight methods
  getAllFlights(): Promise<Flight[]>;
  getFlight(id: string): Promise<Flight | undefined>;
  getFlightByNumber(flightNumber: string): Promise<Flight | undefined>;
  searchFlights(origin: string, destination: string, departureDate?: Date): Promise<Flight[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  updateFlight(id: string, flight: Partial<InsertFlight>): Promise<Flight | undefined>;
  deleteFlight(id: string): Promise<boolean>;

  // Passenger methods
  getAllPassengers(): Promise<Passenger[]>;
  getPassenger(id: string): Promise<Passenger | undefined>;
  getPassengersByUserId(userId: string): Promise<Passenger[]>;
  searchPassengers(query: string): Promise<Passenger[]>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  updatePassenger(id: string, passenger: Partial<InsertPassenger>): Promise<Passenger | undefined>;
  deletePassenger(id: string): Promise<boolean>;

  // Ticket methods
  getAllTickets(): Promise<(Ticket & { flight: Flight; passenger: Passenger })[]>;
  getTicket(id: string): Promise<(Ticket & { flight: Flight; passenger: Passenger }) | undefined>;
  getTicketsByUserId(userId: string): Promise<(Ticket & { flight: Flight; passenger: Passenger })[]>;
  getTicketByNumber(ticketNumber: string): Promise<(Ticket & { flight: Flight; passenger: Passenger }) | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;

  // Transaction methods
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Seat methods
  getSeatsByFlightId(flightId: string): Promise<Seat[]>;
  getSeat(flightId: string, seatNumber: string): Promise<Seat | undefined>;
  updateSeatAvailability(flightId: string, seatNumber: string, isAvailable: boolean): Promise<boolean>;
  createSeatsForFlight(flightId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  // Flight methods
  async getAllFlights(): Promise<Flight[]> {
    const now = new Date();
    const allFlights = await db.select().from(flights).orderBy(flights.departureTime);
    // Filter out flights that have already departed
    return allFlights.filter(flight => new Date(flight.departureTime) > now);
  }

  async getFlight(id: string): Promise<Flight | undefined> {
    const [flight] = await db.select().from(flights).where(eq(flights.id, id));
    return flight || undefined;
  }

  async getFlightByNumber(flightNumber: string): Promise<Flight | undefined> {
    const [flight] = await db.select().from(flights).where(eq(flights.flightNumber, flightNumber));
    return flight || undefined;
  }

  async searchFlights(origin: string, destination: string, departureDate?: Date): Promise<Flight[]> {
    let query = db.select().from(flights)
      .where(and(
        like(flights.origin, `%${origin}%`),
        like(flights.destination, `%${destination}%`)
      ));

    // Remove departureDate filtering for now - this needs proper implementation
    // if (departureDate) {
    //   // TODO: Implement proper date range filtering
    // }

    return await query.orderBy(flights.departureTime);
  }

  async createFlight(flight: InsertFlight): Promise<Flight> {
    const [newFlight] = await db
      .insert(flights)
      .values(flight)
      .returning();

    // Create seats for the flight
    await this.createSeatsForFlight(newFlight.id);

    return newFlight;
  }

  async updateFlight(id: string, flight: Partial<InsertFlight>): Promise<Flight | undefined> {
    const [updatedFlight] = await db
      .update(flights)
      .set(flight)
      .where(eq(flights.id, id))
      .returning();
    return updatedFlight || undefined;
  }

  async deleteFlight(id: string): Promise<boolean> {
    const result = await db.delete(flights).where(eq(flights.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Passenger methods
  async getAllPassengers(): Promise<Passenger[]> {
    return await db.select().from(passengers).orderBy(desc(passengers.createdAt));
  }

  async getPassenger(id: string): Promise<Passenger | undefined> {
    const [passenger] = await db.select().from(passengers).where(eq(passengers.id, id));
    return passenger || undefined;
  }

  async getPassengersByUserId(userId: string): Promise<Passenger[]> {
    return await db.select().from(passengers).where(eq(passengers.userId, userId));
  }

  async searchPassengers(query: string): Promise<Passenger[]> {
    return await db.select().from(passengers)
      .where(
        and(
          like(passengers.firstName, `%${query}%`),
          like(passengers.lastName, `%${query}%`)
        )
      )
      .orderBy(passengers.firstName);
  }

  async createPassenger(passenger: InsertPassenger): Promise<Passenger> {
    const [newPassenger] = await db
      .insert(passengers)
      .values(passenger)
      .returning();
    return newPassenger;
  }

  async updatePassenger(id: string, passenger: Partial<InsertPassenger>): Promise<Passenger | undefined> {
    const [updatedPassenger] = await db
      .update(passengers)
      .set(passenger)
      .where(eq(passengers.id, id))
      .returning();
    return updatedPassenger || undefined;
  }

  async deletePassenger(id: string): Promise<boolean> {
    const result = await db.delete(passengers).where(eq(passengers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Ticket methods
  async getAllTickets(): Promise<(Ticket & { flight: Flight; passenger: Passenger })[]> {
    return await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        flightId: tickets.flightId,
        passengerId: tickets.passengerId,
        userId: tickets.userId,
        seatNumber: tickets.seatNumber,
        seatClass: tickets.seatClass,
        bookingReference: tickets.bookingReference,
        price: tickets.price,
        status: tickets.status,
        checkedIn: tickets.checkedIn,
        createdAt: tickets.createdAt,
        flight: flights!,
        passenger: passengers!,
      })
      .from(tickets)
      .leftJoin(flights, eq(tickets.flightId, flights.id))
      .leftJoin(passengers, eq(tickets.passengerId, passengers.id))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: string): Promise<(Ticket & { flight: Flight; passenger: Passenger }) | undefined> {
    const [ticket] = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        flightId: tickets.flightId,
        passengerId: tickets.passengerId,
        userId: tickets.userId,
        seatNumber: tickets.seatNumber,
        seatClass: tickets.seatClass,
        bookingReference: tickets.bookingReference,
        price: tickets.price,
        status: tickets.status,
        checkedIn: tickets.checkedIn,
        createdAt: tickets.createdAt,
        flight: flights!,
        passenger: passengers!,
      })
      .from(tickets)
      .leftJoin(flights, eq(tickets.flightId, flights.id))
      .leftJoin(passengers, eq(tickets.passengerId, passengers.id))
      .where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getTicketsByUserId(userId: string): Promise<(Ticket & { flight: Flight; passenger: Passenger })[]> {
    return await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        flightId: tickets.flightId,
        passengerId: tickets.passengerId,
        userId: tickets.userId,
        seatNumber: tickets.seatNumber,
        seatClass: tickets.seatClass,
        bookingReference: tickets.bookingReference,
        price: tickets.price,
        status: tickets.status,
        checkedIn: tickets.checkedIn,
        createdAt: tickets.createdAt,
        flight: flights!,
        passenger: passengers!,
      })
      .from(tickets)
      .leftJoin(flights, eq(tickets.flightId, flights.id))
      .leftJoin(passengers, eq(tickets.passengerId, passengers.id))
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketByNumber(ticketNumber: string): Promise<(Ticket & { flight: Flight; passenger: Passenger }) | undefined> {
    const [ticket] = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        flightId: tickets.flightId,
        passengerId: tickets.passengerId,
        userId: tickets.userId,
        seatNumber: tickets.seatNumber,
        seatClass: tickets.seatClass,
        bookingReference: tickets.bookingReference,
        price: tickets.price,
        status: tickets.status,
        checkedIn: tickets.checkedIn,
        createdAt: tickets.createdAt,
        flight: flights!,
        passenger: passengers!,
      })
      .from(tickets)
      .leftJoin(flights, eq(tickets.flightId, flights.id))
      .leftJoin(passengers, eq(tickets.passengerId, passengers.id))
      .where(eq(tickets.ticketNumber, ticketNumber));
    return ticket || undefined;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db
      .insert(tickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set(ticket)
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async deleteTicket(id: string): Promise<boolean> {
    try {
      const result = await db.delete(tickets).where(eq(tickets.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return false;
    }
  }

  // Transaction methods
  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // Seat methods
  async getSeatsByFlightId(flightId: string): Promise<Seat[]> {
    return await db
      .select()
      .from(seats)
      .where(eq(seats.flightId, flightId))
      .orderBy(seats.seatNumber);
  }

  async getSeat(flightId: string, seatNumber: string): Promise<Seat | undefined> {
    const [seat] = await db
      .select()
      .from(seats)
      .where(and(eq(seats.flightId, flightId), eq(seats.seatNumber, seatNumber)));
    return seat || undefined;
  }

  async updateSeatAvailability(flightId: string, seatNumber: string, isAvailable: boolean): Promise<boolean> {
    const result = await db
      .update(seats)
      .set({ isAvailable })
      .where(and(eq(seats.flightId, flightId), eq(seats.seatNumber, seatNumber)));
    return (result.rowCount ?? 0) > 0;
  }

  async createSeatsForFlight(flightId: string): Promise<void> {
    // Generate seats for a typical Boeing 737 configuration
    const seatConfig = [
      { rows: 3, class: 'first', cols: ['A', 'B', 'C', 'D'], price: 150 },
      { rows: 5, class: 'business', cols: ['A', 'B', 'C', 'D', 'E', 'F'], price: 100 },
      { rows: 20, class: 'economy', cols: ['A', 'B', 'C', 'D', 'E', 'F'], price: 0 }
    ];

    const seatsToInsert: InsertSeat[] = [];
    let currentRow = 1;

    for (const config of seatConfig) {
      for (let row = 0; row < config.rows; row++) {
        for (const col of config.cols) {
          const seatNumber = `${currentRow}${col}`;
          seatsToInsert.push({
            flightId,
            seatNumber,
            seatClass: config.class as 'first' | 'business' | 'economy',
            price: config.price.toString(),
            isAvailable: true
          });
        }
        currentRow++;
      }
    }

    await db.insert(seats).values(seatsToInsert);
  }
}

export const storage = new DatabaseStorage();