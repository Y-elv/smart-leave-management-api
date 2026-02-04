import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import leaveRoutes from './routes/leave.routes.js';

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'smart-leave-management-api' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Resource not found.',
    path: req.originalUrl,
  });
});

// Global error handler (last in the chain)
// Ensures we never leak internal errors to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: 'Internal server error.',
  });
});

export default app;

