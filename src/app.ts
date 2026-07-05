import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cookieParser());

// CORS setup
app.use(
  cors({
    origin: config.appUrl,
    credentials: true,
  })
);

// Application Routes
// TODO: Mount API routes here later under /api (e.g., app.use('/api', router))

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to GearUp API',
  });
});

// Not Found Route
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
