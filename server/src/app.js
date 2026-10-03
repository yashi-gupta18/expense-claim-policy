import cors from 'cors';
import express from 'express';
import claimRoutes from './routes/claimRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/claims', claimRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api', reviewRoutes);
app.use('/api', auditRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.name === 'ZodError') {
    return res.status(400).json({ message: 'Invalid request body', errors: error.errors });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource id' });
  }
  console.error(error);
  res.status(500).json({ message: 'Server error', detail: error.message });
});

export default app;
