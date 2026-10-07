import accountModel from '../models/account.model.js';
import mongoose from 'mongoose';



export async function createAccountController(req, res){
    const user = req.user; 


    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        message: "Account created succesfully",
        account
    })
}
    

export async function getUserAccountsController(req, res){

    const accounts = await accountModel.find({
        user: req.user._id
    })

    res.status(200).json({
        message: "Accounts fetched succesfully",
        accounts
    })

}


export async function getAccountBalanceController(req, res){
    const {accountId} = req.params;

    if(!mongoose.isObjectIdOrHexString(accountId)){
        return res.status(400).json({
            message: 'Invalid account ID. Use an account _id from GET /api/account.'
        });
    }

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })
    if(!account){
        return res.status(404).json({
            message: 'Account not found for the authenticated user. Use an account _id from GET /api/account.'
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        message: "Account balance fetched succesfully",
        balance
    })
}
