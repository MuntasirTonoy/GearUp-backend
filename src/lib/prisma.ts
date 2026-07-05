import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString } as any); // Type cast to bypass if the types expect a Pool
const prisma = new PrismaClient({ adapter });

export { prisma };
