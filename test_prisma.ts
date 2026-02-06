
import { prisma } from "./lib/prisma"

async function main() {
  console.log("Prisma instance:", prisma)
  try {
      // Try a simple query if possible, or just check instance
      // const studio = await prisma.studio.findFirst();
      // console.log("Studio:", studio);
      console.log("Successfully imported prisma")
  } catch (e) {
      console.error("Error using prisma:", e)
  }
}

main()
