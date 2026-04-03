
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = parseInt(process.env.PORT ?? '5000', 10);

async function bootstrap(): Promise<void> {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });

  // Graceful shutdown — close DB connections on SIGTERM (e.g. Render deployments)
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
  });
}

bootstrap();
