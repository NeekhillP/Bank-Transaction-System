import accountModel from '../models/account.model.js';



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
