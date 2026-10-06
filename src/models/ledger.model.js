import mongoose from 'mongoose';


const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true 
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a ledger entry"],
        min: [0, "Ledger amount cannot be negative"],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "Ledger type can be either CREDIT or DEBIT"
        },
        required: [true, "Ledger type is required"],
        immutable: true
    }
})

// Prevent any modifications to ledger entries after they are created
function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified after creation.");
}


// Prevent any updates or deletions to ledger entries after they are created
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const ledgerModel = mongoose.model('Ledger', ledgerSchema);

export default ledgerModel;