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

    // Seed flights with Tamil Nadu focus - using current and future dates
    console.log("🛫 Seeding flights...");

    // Get current date and time
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Helper function to create future dates
    const getFlightDate = (daysFromNow: number, hours: number, minutes: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysFromNow);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    // Helper function to add duration to departure time
    const getArrivalTime = (departureTime: Date, durationMinutes: number) => {
      const arrival = new Date(departureTime);
      arrival.setMinutes(arrival.getMinutes() + durationMinutes);
      return arrival;
    };

    const flightData = [
      // Today's flights (only future ones)
      ...(now.getHours() < 6 ? [{
        flightNumber: "AI342",
        airline: "Air India",
        aircraft: "Boeing 737-800",
        origin: "Chennai (MAA)",
        destination: "Mumbai (BOM)",
        departureTime: getFlightDate(0, 6, 30),
        arrivalTime: getFlightDate(0, 8, 45),
        duration: 135,
        basePrice: "5500.00",
        totalSeats: 180,
        availableSeats: 165,
        gate: "A12",
        status: "scheduled"
      }] : []),

      ...(now.getHours() < 9 ? [{
        flightNumber: "6E723",
        airline: "IndiGo",
        aircraft: "Airbus A320neo",
        origin: "Chennai (MAA)",
        destination: "Delhi (DEL)",
        departureTime: getFlightDate(0, 9, 15),
        arrivalTime: getFlightDate(0, 12, 0),
        duration: 165,
        basePrice: "6200.00",
        totalSeats: 180,
        availableSeats: 172,
        gate: "B3",
        status: "scheduled"
      }] : []),

      ...(now.getHours() < 14 ? [{
        flightNumber: "SG134",
        airline: "SpiceJet",
        aircraft: "Boeing 737 MAX",
        origin: "Chennai (MAA)",
        destination: "Bangalore (BLR)",
        departureTime: getFlightDate(0, 14, 20),
        arrivalTime: getFlightDate(0, 15, 35),
        duration: 75,
        basePrice: "3200.00",
        totalSeats: 189,
        availableSeats: 178,
        gate: "C5",
        status: "scheduled"
      }] : []),

      ...(now.getHours() < 16 ? [{
        flightNumber: "AI445",
        airline: "Air India",
        aircraft: "Airbus A321",
        origin: "Mumbai (BOM)",
        destination: "Chennai (MAA)",
        departureTime: getFlightDate(0, 16, 45),
        arrivalTime: getFlightDate(0, 19, 15),
        duration: 150,
        basePrice: "5800.00",
        totalSeats: 200,
        availableSeats: 185,
        gate: "A8",
        status: "scheduled"
      }] : []),

      ...(now.getHours() < 21 ? [{
        flightNumber: "6E456",
        airline: "IndiGo",
        aircraft: "Airbus A320",
        origin: "Delhi (DEL)",
        destination: "Chennai (MAA)",
        departureTime: getFlightDate(0, 21, 30),
        arrivalTime: getFlightDate(1, 0, 20),
        duration: 170,
        basePrice: "6500.00",
        totalSeats: 180,
        availableSeats: 168,
        gate: "B7",
        status: "scheduled"
      }] : []),

      // Tomorrow's flights
      {
        flightNumber: "AI156",
        airline: "Air India",
        aircraft: "Boeing 787-8",
        origin: "Chennai (MAA)",
        destination: "Kochi (COK)",
        departureTime: getFlightDate(1, 7, 0),
        arrivalTime: getFlightDate(1, 8, 15),
        duration: 75,
        basePrice: "4200.00",
        totalSeats: 254,
        availableSeats: 240,
        gate: "A2",
        status: "scheduled"
      },
      {
        flightNumber: "6E789",
        airline: "IndiGo",
        aircraft: "Airbus A320neo",
        origin: "Kochi (COK)",
        destination: "Chennai (MAA)",
        departureTime: getFlightDate(1, 12, 30),
        arrivalTime: getFlightDate(1, 13, 45),
        duration: 75,
        basePrice: "4100.00",
        totalSeats: 180,
        availableSeats: 175,
        gate: "C2",
        status: "scheduled"
      },
      {
        flightNumber: "SG267",
        airline: "SpiceJet",
        aircraft: "Boeing 737-800",
        origin: "Chennai (MAA)",
        destination: "Coimbatore (CJB)",
        departureTime: getFlightDate(1, 15, 45),
        arrivalTime: getFlightDate(1, 16, 45),
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
        departureTime: getFlightDate(1, 18, 45),
        arrivalTime: getFlightDate(1, 20, 10),
        duration: 85,
        basePrice: "5200.00",
        totalSeats: 158,
        availableSeats: 145,
        gate: "C9",
        status: "scheduled"
      },

      // Day after tomorrow's flights
      {
        flightNumber: "AI892",
        airline: "Air India",
        aircraft: "Boeing 737-800",
        origin: "Chennai (MAA)",
        destination: "Kolkata (CCU)",
        departureTime: getFlightDate(2, 8, 0),
        arrivalTime: getFlightDate(2, 10, 30),
        duration: 150,
        basePrice: "6800.00",
        totalSeats: 180,
        availableSeats: 170,
        gate: "A15",
        status: "scheduled"
      },
      {
        flightNumber: "6E234",
        airline: "IndiGo",
        aircraft: "Airbus A320neo",
        origin: "Bangalore (BLR)",
        destination: "Chennai (MAA)",
        departureTime: getFlightDate(2, 11, 15),
        arrivalTime: getFlightDate(2, 12, 30),
        duration: 75,
        basePrice: "3400.00",
        totalSeats: 180,
        availableSeats: 168,
        gate: "B9",
        status: "scheduled"
      },
      {
        flightNumber: "SG445",
        airline: "SpiceJet",
        aircraft: "Boeing 737 MAX",
        origin: "Chennai (MAA)",
        destination: "Pune (PNQ)",
        departureTime: getFlightDate(2, 16, 30),
        arrivalTime: getFlightDate(2, 18, 45),
        duration: 135,
        basePrice: "4900.00",
        totalSeats: 189,
        availableSeats: 175,
        gate: "C7",
        status: "scheduled"
      }
    ].filter(flight => flight.departureTime > now); // Only include future flights
    
    const createdFlights = await db.insert(flights).values(flightData).returning();

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