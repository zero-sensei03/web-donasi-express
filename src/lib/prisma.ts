import { Env } from "../config/env";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = Env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables (.env)");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export { prisma };