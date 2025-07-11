import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth.route.js';
import productsRoute from './routes/products.route.js';
import cartRoutes from './routes/cart.route.js';
import coupanRoutes from './routes/coupan.route.js';
import paymentsRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import {connectDB} from './lib/db.js';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  credentials: true, // Allow cookies and credentials
}));

app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/products', productsRoute)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/coupan', coupanRoutes)
app.use('/api/v1/payments', paymentsRoutes)
app.use('/api/v1/analytics', analyticsRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB()
});

// CY1gu7HYHebwV8Ig