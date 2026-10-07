import { Router } from "express";
import {authMiddleware} from '../middleware/auth.middleware.js';
import * as accountController from '../controllers/account.controller.js';


const accountRoutes = Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 *  - Protected route, requires authentication
 */

accountRoutes.post('/', authMiddleware, accountController.createAccountController )


/**
 * - GET /api/accounts/
 * - Get all accounts for the authenticated user
 *  - Protected route, requires authentication
 */

accountRoutes.get('/', authMiddleware, accountController.getUserAccountsController)



/**
 * - GET /api/accounts/balance/:accountId
 * - Get the balance of a specific account by accountId
 *  - Protected route, requires authentication
 */
 accountRoutes.get('/balance/:accountId', authMiddleware, accountController.getAccountBalanceController)


export default accountRoutes;