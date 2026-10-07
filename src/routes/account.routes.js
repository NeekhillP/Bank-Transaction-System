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



export default accountRoutes;