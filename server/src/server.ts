import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  // Create Express application
  const app = createApp();

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Start listening
  httpServer.listen(config.port, () => {
    console.log(`[Server] CreatorFlow API running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/v1/health`);
  });

  // Connect database in background
  connectDB().catch((err) => {
    console.warn(`[Database] Connection warning: ${err.message}`);
  });
};

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
