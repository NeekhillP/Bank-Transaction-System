import Router from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import {authMiddleware, authSystemUserMiddleware} from '../middleware/auth.middleware.js';

const transactionRouter = Router();


/**
 * - POST /api/transactions/
 * @summary Create a new transaction
 * @tags Transactions
 */

transactionRouter.post('/', authMiddleware, transactionController.createTransaction)


/**
 * - POST /api/transactions/system/initial-funds
 * @summary Create a new transaction for system initial funds
 * @tags Transactions
 */

transactionRouter.post('/system/initial-funds', authSystemUserMiddleware, transactionController.createSystemInitialFundsTransaction)



export default transactionRouter;