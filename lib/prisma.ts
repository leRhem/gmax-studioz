import { PrismaClient } from "./generated/prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const prismaClientSingleton = () => {
  // Fallback to dummy URL if missing to prevent build-time crash
  // Note: Queries will fail if this dummy URL is used, but build should pass
  const url = process.env.DATABASE_URL || "prisma://dummy.prisma-data.net/?api_key=dummy"

  if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV === "production") {
          console.warn("DATABASE_URL is missing in production!")
      } else {
          console.warn("DATABASE_URL is missing")
      }
  }

  return new PrismaClient({
    accelerateUrl: url,
  }).$extends(withAccelerate())
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma