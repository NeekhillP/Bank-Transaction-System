import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';


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
}