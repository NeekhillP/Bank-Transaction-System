import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import {sendRegistrationEmail} from '../services/email.service.js';

/**
 * - user Register controller
 * - POST /api/auth/register
 */

export async function userRegister(req, res){
    const {email, password, name} = req.body;

    const isExistingUser = await userModel.findOne({
        email: email
    })

    if(isExistingUser){
        return res.status(422).json({
            message: "User already exists",
            status: "failed"
        })
    }

    const newUser = await userModel.create({
        email: email,
        password: password,
        name: name
    })

    const token = jwt.sign({
        userId: newUser._id
    }, process.env.JWT_SECRET,{
        expiresIn: '3d'
    })

    res.cookie('jwt_token', token)


    res.status(201).json({
        message: "User registered successfully",
        user: {
            email: newUser.email,
            name: newUser.name,
        },
        token: token
    })

    // Send registration email
    try{
        await sendRegistrationEmail(newUser.email, newUser.name);
        console.log('Registration email sent successfully');
    } catch (error) {
        console.error('Error sending registration email:', error);
    }

}


/**
* - user Login controller
* - POST /api/auth/login
*/
export async function userLogin(req, res){
    const {email, password} = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if(!user){
        return res.status(401).json({
            message: "Invalid email or password",
            status: "failed"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message: "Invalid email or password",
            status: "failed"
        })
    }

    const token = jwt.sign({
        userId: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    })

    res.cookie('jwt_token', token)

    res.status(200).json({
        message: "User logged in successfully",
        user:{
            email: user.email,
            name: user.name
        }
    })
}
