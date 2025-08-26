import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
  insertUserSchema, 
  loginSchema, 
  signupSchema,
  insertPassengerSchema,
  insertTicketSchema,
  insertTransactionSchema,
  insertFlightSchema,
  type User 
} from "@shared/schema";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: User;
}

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to verify employee role
const requireEmployee = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'employee') {
    return res.status(403).json({ message: 'Employee access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const { confirmPassword, ...userToCreate } = userData;
      const user = await storage.createUser(userToCreate);
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, role } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== role) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: { ...req.user, password: undefined } });
  });

  // Flight routes
  app.get('/api/flights', async (req, res) => {
    try {
      const flights = await storage.getAllFlights();
      res.json(flights);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/flights/search', async (req, res) => {
    try {
      const { from, to, departureDate } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ message: 'From and To locations are required' });
      }

      const date = departureDate ? new Date(departureDate as string) : undefined;
      const flights = await storage.searchFlights(from as string, to as string, date);
      
      res.json(flights);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/flights/:id', async (req, res) => {
    try {
      const flight = await storage.getFlight(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      res.json(flight);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/flights/:id/seats', async (req, res) => {
    try {
      const seats = await storage.getSeatsByFlightId(req.params.id);
      res.json(seats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Booking routes
  app.post('/api/bookings/create', authenticateToken, async (req: any, res) => {
    try {
      const { flightId, passengerData, seatNumber, paymentMethod } = req.body;
      
      // Verify flight exists and seat is available
      const flight = await storage.getFlight(flightId);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      const seat = await storage.getSeat(flightId, seatNumber);
      if (!seat || !seat.isAvailable) {
        return res.status(400).json({ message: 'Seat not available' });
      }

      // Create passenger
      const passengerToCreate = insertPassengerSchema.parse({
        ...passengerData,
        userId: req.user.id
      });
      const passenger = await storage.createPassenger(passengerToCreate);

      // Generate unique ticket number and booking reference
      const ticketNumber = `TK-${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const bookingReference = `BKG-${Date.now().toString().substr(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

      // Calculate total price
      const basePrice = parseFloat(flight.basePrice);
      const seatPrice = parseFloat(seat.price);
      const totalPrice = basePrice + seatPrice;

      // Create ticket
      const ticketData = insertTicketSchema.parse({
        ticketNumber,
        flightId,
        passengerId: passenger.id,
        userId: req.user.id,
        seatNumber,
        seatClass: seat.seatClass,
        bookingReference,
        price: totalPrice.toString(),
        status: 'confirmed'
      });
      const ticket = await storage.createTicket(ticketData);

      // Update seat availability
      await storage.updateSeatAvailability(flightId, seatNumber, false);

      // Create transaction
      const transactionData = insertTransactionSchema.parse({
        transactionNumber: `TXN-${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        userId: req.user.id,
        ticketId: ticket.id,
        bookingReference,
        amount: totalPrice.toString(),
        paymentMethod,
        status: 'completed'
      });
      const transaction = await storage.createTransaction(transactionData);

      res.json({ 
        ticket,
        passenger,
        transaction,
        bookingReference,
        message: 'Booking created successfully'
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/bookings/:id', authenticateToken, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user owns this ticket or is employee
      if (ticket.userId !== req.user.id && req.user.role !== 'employee') {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User tickets
  app.get('/api/tickets', authenticateToken, async (req: any, res) => {
    try {
      const tickets = await storage.getTicketsByUserId(req.user.id);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User transactions
  app.get('/api/transactions', authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employee routes - Passenger management
  app.get('/api/employee/passengers', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const { search } = req.query;
      let passengers;
      
      if (search) {
        passengers = await storage.searchPassengers(search as string);
      } else {
        passengers = await storage.getAllPassengers();
      }
      
      res.json(passengers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/employee/passengers', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const passengerData = insertPassengerSchema.parse(req.body);
      const passenger = await storage.createPassenger(passengerData);
      res.json(passenger);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/employee/passengers/:id', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const passengerData = insertPassengerSchema.partial().parse(req.body);
      const passenger = await storage.updatePassenger(req.params.id, passengerData);
      if (!passenger) {
        return res.status(404).json({ message: 'Passenger not found' });
      }
      res.json(passenger);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/employee/passengers/:id', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const success = await storage.deletePassenger(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Passenger not found' });
      }
      res.json({ message: 'Passenger deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employee routes - Ticket management
  app.get('/api/employee/tickets', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put('/api/employee/tickets/:id', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateTicket(req.params.id, ticketData);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/employee/tickets/:id', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.json({ message: 'Ticket cancelled successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employee routes - Flight management
  app.post('/api/employee/flights', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const flightData = insertFlightSchema.parse(req.body);
      const flight = await storage.createFlight(flightData);
      res.json(flight);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/employee/flights/:id', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const flightData = insertFlightSchema.partial().parse(req.body);
      const flight = await storage.updateFlight(req.params.id, flightData);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      res.json(flight);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/employee/flights/:id', authenticateToken, requireEmployee, async (req, res) => {
    try {
      const success = await storage.deleteFlight(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      res.json({ message: 'Flight deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ticket action routes
  app.post('/api/tickets/:id/checkin', authenticateToken, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user owns this ticket
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if already checked in
      if (ticket.checkedIn) {
        return res.status(400).json({ message: 'Already checked in' });
      }

      // Check if flight is in the future
      const flightDate = new Date(ticket.flight.departureTime);
      const now = new Date();
      const timeDiff = flightDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff > 24) {
        return res.status(400).json({ message: 'Check-in opens 24 hours before departure' });
      }

      if (hoursDiff < 0) {
        return res.status(400).json({ message: 'Flight has already departed' });
      }

      const updatedTicket = await storage.updateTicket(req.params.id, { 
        checkedIn: true,
        status: 'checked_in'
      });

      res.json({ 
        ticket: updatedTicket,
        message: 'Checked in successfully' 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/tickets/:id/cancel', authenticateToken, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user owns this ticket
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if already cancelled
      if (ticket.status === 'cancelled') {
        return res.status(400).json({ message: 'Ticket already cancelled' });
      }

      // Check if flight has already departed
      const flightDate = new Date(ticket.flight.departureTime);
      const now = new Date();
      
      if (flightDate < now) {
        return res.status(400).json({ message: 'Cannot cancel ticket for departed flight' });
      }

      const updatedTicket = await storage.updateTicket(req.params.id, { 
        status: 'cancelled'
      });

      // Make seat available again
      await storage.updateSeatAvailability(ticket.flightId, ticket.seatNumber, true);

      res.json({ 
        ticket: updatedTicket,
        message: 'Ticket cancelled successfully' 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/tickets/:id/change-seat', authenticateToken, async (req: any, res) => {
    try {
      const { seatNumber } = req.body;
      
      if (!seatNumber) {
        return res.status(400).json({ message: 'Seat number is required' });
      }

      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user owns this ticket
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if new seat is available
      const newSeat = await storage.getSeat(ticket.flightId, seatNumber);
      if (!newSeat || !newSeat.isAvailable) {
        return res.status(400).json({ message: 'Seat not available' });
      }

      // Make old seat available
      await storage.updateSeatAvailability(ticket.flightId, ticket.seatNumber, true);
      
      // Reserve new seat
      await storage.updateSeatAvailability(ticket.flightId, seatNumber, false);

      // Update ticket
      const updatedTicket = await storage.updateTicket(req.params.id, { 
        seatNumber,
        seatClass: newSeat.seatClass
      });

      res.json({ 
        ticket: updatedTicket,
        message: 'Seat changed successfully' 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
