import { PrismaClient } from './generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg' // Use named import

// 1. Use Hyperdrive if available (Runtime), otherwise DATABASE_URL (Build/Dev)
const connectionString = 
  (globalThis as any).HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL;

// 2. Configure the pool
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// 3. Initialize Prisma
export const prisma = new PrismaClient({ adapter })