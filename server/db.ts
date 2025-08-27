import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import 'dotenv/config'; // load env vars

// ✅ Detect environment
const isProduction = process.env.NODE_ENV === "production";

// Choose correct database URL
const connectionString = isProduction
  ? process.env.PROD_DATABASE_URL
  : process.env.LOCAL_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set in your environment variables");
}

// Create a connection pool
export const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Drizzle ORM
export const db = drizzle(pool, { schema });
