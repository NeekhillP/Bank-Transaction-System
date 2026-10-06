import transactionModel from '../models/transaction.model.js';
import ledgerModel from '../models/ledger.model.js';
import accountModel from '../models/account.model.js';
import { sendTransactionEmail, sendTransactionFailureEmail } from '../services/email.service.js';
import mongoose from 'mongoose';
/**
 * * - Create a new transaction 
 */


export async function createTransaction(req, res){
    // 1. Validate request body
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message: 'Missing required fields'});
    }

    try{
        const fromUserAccount = await accountModel.findOne({
            _id: fromAccount,
        })

        const toUserAccount = await accountModel.findOne({
            _id: toAccount,
        })

        if(!fromUserAccount || !toUserAccount){
            return res.status(404).json({message: 'Account not found'});
        }

        // 2. Validate idempotency key
        const existingTransaction = await transactionModel.findOne({
            idempotencyKey: idempotencyKey
        })
        if(existingTransaction){
            if(existingTransaction.status === 'COMPLETED'){
                return res.status(200).json({
                    message: "Transaction already processed",
                    transaction: existingTransaction
                })
            }

            if(existingTransaction.status === 'PENDING'){
                return res.status(200).json({
                    message: "Transaction is still pending"
                })
            }

            if(existingTransaction.status === 'FAILED'){
                return res.status(500).json({
                    message: "Transaction failed previously"
                })
            }

            if(existingTransaction.status === 'REVERSED'){
                return res.status(500).json({
                    message: "Transaction was reversed, please retry"
                })
            }
        }


        // 3. Check account status
        if(fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE'){
            return res.status(400).json({
                message: 'One or both accounts are not active'
            })
        }

        // 4. Derive sender balance from ledger
        const balance = await fromUserAccount.getBalance();

        if(balance < amount){
            return res.status(400).json({
                message: `Insufficient balance in sender account. Current balance: ${balance}, Requested amount: ${amount}`
            })
        }

        // 5. Create a new transaction
        // We create session in order to ensure that the transaction and ledger entries are created atomically. If any part of the process fails, we can roll back the entire operation to maintain data integrity.
        const session = await mongoose.startSession();
        session.startTransaction();

        const newTransaction = await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }, {session});


        // 6. Create ledger entries

        const debitLedgerEntry = await ledgerModel.create({
            account: fromAccount,
            amount: amount,
            type: 'DEBIT',
            transaction: newTransaction._id
        }, {session});

        const creditLedgerEntry = await ledgerModel.create({
            account: toAccount,
            amount: amount,
            type: 'CREDIT',
            transaction: newTransaction._id
        }, {session});

        // 7. Update transaction status to COMPLETED
        newTransaction.status = 'COMPLETED';
        await newTransaction.save({session});

        // 8. Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // 9. Send email notifications
        await sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount._id);
       

        return res.status(201).json({
            message: 'Transaction completed successfully',
            transaction: newTransaction
        })
        
    }catch(error){
        return res.status(500).json({message: 'Internal server error', error: error.message})
    }

}