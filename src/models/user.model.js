import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: [true, 'Email is required'],
        trim:true,
        lowercase:true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email'],
        unique: [true, 'Email already exists']
    },
    name: {
        type:String,
        required: [true, 'Name is required'],

    },
    password: {
        type:String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select:false
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, {
    timestamps:true
})

// it is a middleware function that will be executed before saving a user document to the database. 
// You can use this function to perform actions such as hashing the password before saving it.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});



// This method is used to compare the password provided by the user during login with the hashed password stored in the database.
userSchema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password, this.password);

}

const userModel = mongoose.model('User', userSchema);

export default userModel;