import { db } from "./db";
import { users, flights, passengers, tickets, transactions, seats } from "@shared/schema";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (for development)
    await db.execute(sql`TRUNCATE TABLE transactions, tickets, seats, passengers, flights, users RESTART IDENTITY CASCADE`);

    // Sample users for Tamil Nadu
    const sampleUsers = [
      {
        firstName: "Priya",
        lastName: "Krishnan", 
        email: "priya.krishnan@gmail.com",
        phone: "+91 98765 43210",
        password: await bcrypt.hash("password123", 10),
        role: "customer" as const
      },
      {
        firstName: "Arjun",
        lastName: "Raman",
        email: "arjun.raman@yahoo.com", 
        phone: "+91 94567 89012",
        password: await bcrypt.hash("password123", 10),
        role: "customer" as const
      },
      {
        firstName: "Lakshmi",
        lastName: "Sharma",
        email: "lakshmi.employee@airways.com",
        phone: "+91 91234 56789",
        password: await bcrypt.hash("admin123", 10),
        role: "employee" as const
      },
      {
        firstName: "Vijay",
        lastName: "Kumar",
        email: "vijay.employee@airways.com",
        phone: "+91 98765 12345", 
        password: await bcrypt.hash("admin123", 10),
        role: "employee" as const
      }
    ];

    console.log("👥 Seeding users...");
    const createdUsers = await db.insert(users).values(sampleUsers).returning();

    // Tamil Nadu and connecting flights data
    const sampleFlights = [
      {
        flightNumber: "AI841",
        airline: "Air India",
        aircraft: "Airbus A320",
        origin: "Chennai (MAA)",
        destination: "Coimbatore (CJB)",
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        arrivalTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 15 * 60 * 1000), // Tomorrow + 1h 15m
        duration: 75,
        basePrice: "4500.00",
        totalSeats: 180,
        availableSeats: 165,
        gate: "A3",
        status: "scheduled"
      },
      {
        flightNumber: "6E2451",
        airline: "IndiGo",
        aircraft: "Airbus A320neo",
        origin: "Chennai (MAA)",
        destination: "Trichy (TRZ)",
        departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        arrivalTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Day after tomorrow + 1h
        duration: 60,
        basePrice: "3800.00",
        totalSeats: 186,
        availableSeats: 170,
        gate: "B7",
        status: "scheduled"
      },
      {
        flightNumber: "SG8721",
        airline: "SpiceJet",
        aircraft: "Boeing 737-800",
        origin: "Madurai (IXM)",
        destination: "Chennai (MAA)",
        departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        arrivalTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000), // 3 days + 1h 15m
        duration: 75,
        basePrice: "4200.00",
        totalSeats: 189,
        availableSeats: 175,
        gate: "C12",
        status: "scheduled"
      },
      {
        flightNumber: "AI547",
        airline: "Air India",
        aircraft: "Boeing 787",
        origin: "Chennai (MAA)",
        destination: "Delhi (DEL)",
        departureTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        arrivalTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 165 * 60 * 1000), // 4 days + 2h 45m
        duration: 165,
        basePrice: "8900.00",
        totalSeats: 300,
        availableSeats: 275,
        gate: "A15",
        status: "scheduled"
      },
      {
        flightNumber: "6E6157",
        airline: "IndiGo", 
        aircraft: "Airbus A321",
        origin: "Coimbatore (CJB)",
        destination: "Bangalore (BLR)",
        departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        arrivalTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 5 days + 45m
        duration: 45,
        basePrice: "3500.00",
        totalSeats: 220,
        availableSeats: 195,
        gate: "D8",
        status: "scheduled"
      },
      {
        flightNumber: "SG461",
        airline: "SpiceJet",
        aircraft: "Boeing 737",
        origin: "Chennai (MAA)",
        destination: "Mumbai (BOM)",
        departureTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        arrivalTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 135 * 60 * 1000), // 6 days + 2h 15m
        duration: 135,
        basePrice: "6800.00",
        totalSeats: 189,
        availableSeats: 160,
        gate: "B4",
        status: "scheduled"
      },
      {
        flightNumber: "AI542",
        airline: "Air India",
        aircraft: "Airbus A319",
        origin: "Trichy (TRZ)",
        destination: "Chennai (MAA)",
        departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 7 days + 1h
        duration: 60,
        basePrice: "3900.00",
        totalSeats: 144,
        availableSeats: 130,
        gate: "A8",
        status: "scheduled"
      },
      {
        flightNumber: "UK871",
        airline: "Vistara",
        aircraft: "Airbus A320neo",
        origin: "Chennai (MAA)",
        destination: "Hyderabad (HYD)",
        departureTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        arrivalTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 85 * 60 * 1000), // 8 days + 1h 25m
        duration: 85,
        basePrice: "5200.00",
        totalSeats: 158,
        availableSeats: 145,
        gate: "C9",
        status: "scheduled"
      }
    ];

    console.log("✈️ Seeding flights...");
    const createdFlights = await db.insert(flights).values(sampleFlights).returning();

    // Create seats for each flight
    console.log("💺 Creating seats for flights...");
    for (const flight of createdFlights) {
      await createSeatsForFlight(flight.id);
    }

    // Sample passengers
    const samplePassengers = [
      {
        userId: createdUsers[0].id,
        firstName: "Priya",
        lastName: "Krishnan",
        email: "priya.krishnan@gmail.com",
        phone: "+91 98765 43210",
        dateOfBirth: new Date("1990-05-15"),
        nationality: "Indian",
        passportNumber: "P1234567"
      },
      {
        userId: createdUsers[1].id,
        firstName: "Arjun",
        lastName: "Raman", 
        email: "arjun.raman@yahoo.com",
        phone: "+91 94567 89012",
        dateOfBirth: new Date("1985-08-22"),
        nationality: "Indian",
        passportNumber: "P7654321"
      }
    ];

    console.log("👤 Seeding passengers...");
    const createdPassengers = await db.insert(passengers).values(samplePassengers).returning();

    // Sample tickets  
    const sampleTickets = [
      {
        ticketNumber: "TK-20250127001",
        flightId: createdFlights[0].id,
        passengerId: createdPassengers[0].id,
        userId: createdUsers[0].id,
        seatNumber: "12A",
        seatClass: "economy" as const,
        bookingReference: "BKG-TN001",
        price: "4500.00",
        status: "confirmed" as const,
        checkedIn: false
      }
    ];

    console.log("🎫 Seeding tickets...");
    const createdTickets = await db.insert(tickets).values(sampleTickets).returning();

    // Sample transactions
    const sampleTransactions = [
      {
        transactionNumber: "TXN-20250127001",
        userId: createdUsers[0].id,
        ticketId: createdTickets[0].id,
        bookingReference: "BKG-TN001",
        amount: "4500.00",
        paymentMethod: "UPI",
        status: "completed" as const
      }
    ];

    console.log("💳 Seeding transactions...");
    await db.insert(transactions).values(sampleTransactions);

    console.log("✅ Database seeding completed successfully!");
    console.log(`
📊 Seeded Data Summary:
👥 Users: ${createdUsers.length} (2 customers, 2 employees)
✈️ Flights: ${createdFlights.length} Tamil Nadu routes
👤 Passengers: ${createdPassengers.length}
🎫 Tickets: ${createdTickets.length}
💳 Transactions: ${sampleTransactions.length}

🔐 Test Login Credentials:

📱 CUSTOMER ACCOUNTS:
Email: priya.krishnan@gmail.com
Password: password123
Role: customer

Email: arjun.raman@yahoo.com  
Password: password123
Role: customer

👨‍💼 EMPLOYEE ACCOUNTS:
Email: lakshmi.employee@airways.com
Password: admin123
Role: employee

Email: vijay.employee@airways.com
Password: admin123
Role: employee

💡 Use these credentials to test both customer and employee functionalities!
    `);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

async function createSeatsForFlight(flightId: string): Promise<void> {
  // Generate seats for Indian airline configuration
  const seatConfig = [
    { rows: 3, class: 'business', cols: ['A', 'C', 'D', 'F'], price: 2000 },
    { rows: 25, class: 'economy', cols: ['A', 'B', 'C', 'D', 'E', 'F'], price: 0 }
  ];

  const seatsToInsert = [];
  let currentRow = 1;

  for (const config of seatConfig) {
    for (let row = 0; row < config.rows; row++) {
      for (const col of config.cols) {
        const seatNumber = `${currentRow}${col}`;
        seatsToInsert.push({
          flightId,
          seatNumber,
          seatClass: config.class as 'business' | 'economy',
          price: config.price.toString(),
          isAvailable: true
        });
      }
      currentRow++;
    }
  }

  await db.insert(seats).values(seatsToInsert);
}