import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchOptions = {
  cache: "no-store",
};

// Check for database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create a database connection
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
