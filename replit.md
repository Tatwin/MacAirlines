# Airline Reservation System

## Overview

A full-stack airline reservation website built with React (frontend) and Node.js/Express (backend). The system supports customer flight booking and employee management operations. Customers can search for flights, book tickets, select seats, and view their transaction history. Employees have access to a dashboard for managing passenger details and tickets with full CRUD operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with role-based access control
- **Password Security**: bcrypt for password hashing
- **API Structure**: RESTful endpoints organized by feature

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: 
  - Users (customers and employees with role differentiation)
  - Flights (flight schedules and availability)
  - Passengers (passenger information linked to users)
  - Tickets (booking records with seat assignments)
  - Transactions (payment and booking history)
  - Seats (seat availability and class management)

### Authentication & Authorization
- **JWT Strategy**: Token-based authentication stored in localStorage
- **Role-Based Access**: Separate access levels for customers and employees
- **Protected Routes**: Client-side route protection based on user roles
- **Session Management**: Token verification middleware on protected endpoints

### Key Features
- **Flight Search**: Multi-criteria search with date and location filters
- **Seat Selection**: Interactive seat map with class-based pricing
- **Booking Management**: Complete booking workflow from search to confirmation
- **Employee Dashboard**: Administrative interface for passenger and ticket management
- **Transaction History**: Detailed payment and booking records for customers

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections via ws library

### UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

### Development Tools
- **Vite**: Fast development server and build tool
- **Replit Integration**: Development environment support with error overlay
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code formatting and linting (implied by project structure)

### Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and verification

### Form & Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Schema validation for forms and API endpoints
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Styling & CSS
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer
- **class-variance-authority**: Component variant management
- **clsx**: Conditional class name utility