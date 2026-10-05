import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';



export async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        if(!user){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        return next();

    } catch(err){
        return res.status(401).json({ message: 'Unauthorized' });
    }
}