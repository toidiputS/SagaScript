import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Create a database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create drizzle client
export const db = drizzle(pool, { schema });