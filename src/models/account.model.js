import mongoose from 'mongoose';
import ledgerModel from './ledger.model.js';

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Account must belong to a user'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'FROZEN', 'CLOSED'],
            message: 'Status must be either ACTIVE, FROZEN, or CLOSED',
        },
        default: 'ACTIVE'
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'NPR'
    }
}, {
    timestamps: true
})

// Create a compound index on user and status fields to optimize queries that filter by both fields
accountSchema.index({user: 1, status:1})


accountSchema.methods.getBalance = async function() {
    const accountId = this._id;

    const balance = await ledgerModel.aggregate([
        {$match: {account: accountId}},
        {$group: {
            _id: null,
            totalDebit: {$sum: {
                $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0]
            }},
            totalCredit: {$sum: {
                $cond: [{ $eq: ["$type", "CREDIT"]}, "$amount", 0]
            }}
        }},
        {$project: {
            _id: 0,
            balance: {$subtract: ["$totalCredit", "$totalDebit"]}
        }}
    ])

    if(balance.length === 0){
        return 0;
    }

    return balance[0].balance;

}


const accountModel = mongoose.model('Account', accountSchema);

export default accountModel;