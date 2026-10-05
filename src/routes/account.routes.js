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


export default accountRoutes;