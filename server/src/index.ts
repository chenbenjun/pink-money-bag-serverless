import express from "express";
import cors from "cors";
import categoriesRouter from './routes/categories';
import transactionsRouter from './routes/transactions';
import usersRouter from './routes/users';
import feedbacksRouter from './routes/feedbacks';

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/transactions', transactionsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/feedbacks', feedbacksRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
