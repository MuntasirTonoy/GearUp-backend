import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: {
    directory: "prisma/schema"
  },
  migrate: {
    url: process.env.DATABASE_URL
  },
  studio: {
    url: process.env.DATABASE_URL
  }
});
