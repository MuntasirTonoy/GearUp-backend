import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import router from "./routes";

const app: Application = express();

// Webhook parsers - must be before express.json()
app.use("/api/payments/success", express.raw({ type: "application/json" }));
app.use("/api/payments/fail", express.raw({ type: "application/json" }));

// Parsers
app.use(express.json());
app.use(cookieParser());

// CORS setup
app.use(
  cors({
    origin: config.appUrl,
    credentials: true,
  }),
);

// Application Routes
app.use("/api", router);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("GearUp Backend is Running");
});

// Not Found Route (Keep at end)
app.use(notFound);

// Global Error Handler (Keep at end)
app.use(globalErrorHandler);

export default app;
