import mongoose from 'mongoose';


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


const accountModel = mongoose.model('Account', accountSchema);

export default accountModel;