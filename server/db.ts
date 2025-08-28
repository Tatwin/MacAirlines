import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import "dotenv/config"; // Loads .env.* files automatically

// ✅ Detect environment
const nodeEnv = process.env.NODE_ENV || "development";

// ✅ Choose correct database URL
let connectionString: string | undefined;

switch (nodeEnv) {
  case "production":
    connectionString = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    break;
  case "staging":
    connectionString = process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL;
    break;
  default:
    connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
}

if (!connectionString) {
  throw new Error(
    `No database connection string found for NODE_ENV=${nodeEnv}. 
     Please set LOCAL_DATABASE_URL, STAGING_DATABASE_URL, or PROD_DATABASE_URL.`
  );
}

// ✅ Create a connection pool
export const pool = new Pool({
  connectionString,
  ssl: nodeEnv === "production" ? { rejectUnauthorized: false } : false,
});

// ✅ Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

console.log(`Connected to database in ${nodeEnv} mode ✅`);
