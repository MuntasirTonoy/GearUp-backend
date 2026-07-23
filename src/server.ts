import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { Server } from "http";

let server: Server;

async function bootstrap() {
  try {
    // Connect to Prisma
    await prisma.$connect();
    console.log("✅ Connected to database successfully");

    // Start server
    server = app.listen(config.port, () => {
      console.log(
        `🚀 GearUp API server is running on http://localhost:${config.port}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to connect to database", error);
    process.exit(1);
  }
}

bootstrap();

// Global Error Handlers for Node.js process
process.on("unhandledRejection", (error) => {
  console.log(`😈 unhandledRejection is detected, shutting down...`);
  if (server) {
    server.close(() => {
      console.error(error);
      process.exit(1);
    });
  } else {
    console.error(error);
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.log(`😈 uncaughtException is detected, shutting down...`);
  console.error(error);
  process.exit(1);
});
