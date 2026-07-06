import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

interface Config {
  env: string;
  port: number;
  appUrl: string;
  databaseUrl: string;
  bcryptSaltRounds: number;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  payment: {
    provider: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT as string, 10) || 5000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL as string,
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS as string, 10) || 10,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'stripe',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
  },
};

export default config;
