
import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Simple test route
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Pink Money Bag API is running!' });
});

// Export for Vercel
export default app;
