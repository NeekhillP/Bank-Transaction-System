import Router from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import {authMiddleware} from '../middleware/auth.middleware.js';

const transactionRouter = Router();


transactionRouter.post('/', authMiddleware, transactionController.createTransaction)

export default transactionRouter;