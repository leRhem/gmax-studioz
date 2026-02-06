import NextAuth from "next-auth"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { StaffRole } from "@/types/staff"

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials)

          // Find staff member by email
          const staff = await prisma.staff.findUnique({
            where: { email: email.toLowerCase() },
            include: { studio: true },
          })

          // Check if staff exists and is active
          if (!staff || !staff.isActive) {
            return null
          }

          // Check if password is set (account accepted invitation)
          if (!staff.password) {
            throw new Error("Please accept your invitation first")
          }

          // Verify password
          const isValid = await bcrypt.compare(password, staff.password)
          if (!isValid) {
            return null
          }

          // Return user object for session
          return {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            image: staff.image,
            role: staff.role as StaffRole,
            studioId: staff.studioId,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
})