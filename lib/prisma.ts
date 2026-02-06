// lib/prisma.ts
import { PrismaClient } from './generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// 1. Determine the connection string
// In Cloudflare, the binding 'HYPERDRIVE' becomes an object with a 'connectionString' property.
// In local dev, we fall back to the standard env var.
const connectionString = 
  (globalThis as any).HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL;

// 2. Configure the pool
const pool = new pg.Pool({ 
  connectionString,
  // Hyperdrive handles SSL, but pg might complain if local. 
  // Usually for Hyperdrive on Workers, this simple config is enough.
})

// 3. Init the adapter
const adapter = new PrismaPg(pool)

// 4. Pass adapter to Prisma
export const prisma = new PrismaClient({ adapter })