import express from 'express';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import accountRoutes from './routes/account.routes.js';

const app = express();


app.use(express.json());
app.use(cookieParser());


/**
 * @description Routes for authentication
 */
app.use('/api/auth', authRoutes);

/**
 * @description Routes for account management
 */
app.use('/api/account', accountRoutes);



export default app;