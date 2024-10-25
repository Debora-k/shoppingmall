const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const JWT_SECRET_KEY= process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async (req,res) => {
    try{
        const {email, password} = req.body;
        let user = await User.findOne({email});
        if(user){
            const isMatch = await bcrypt.compareSync(password, user.password);
            if(isMatch){
                const token = await user.generateToken();
                return res.status(200).json({status:"success", user, token});
            }
            throw new Error("Email or password are incorrect");
        } else {
            throw new Error("This user doesn't exist!!");
        }
    }catch(error){
        res.status(400).json({status:"failed", error:"Oops, something went wrong! Try login again."});
    }
};

authController.authenticate = async(req,res, next) => {
    try{
        const tokenString = req.headers.authorization;
        if(!tokenString) throw new Error("Token not found");
        const token = tokenString.replace("Bearer ", "");
        //compare token and JWT_SECRET_KEY with verify
        jwt.verify(token,JWT_SECRET_KEY, (error, payload)=>{
            if(error) throw new Error("Invalid token");
            //generateToken contains id
            req.userId = payload._id;
        });
        next(); //userController.getUser
    }catch(error){
        res.status(400).json({status:"failed", error:"Something went wrong. Try again."});
    }
};

authController.checkAdminPermission = async(req,res,next)=> {
    try{
        const {userId} =req;
        const user =await User.findById(userId);
        if(user.level !== "admin") throw new Error("No permission!");
        next();
    } catch(error){
        res.status(400).json({status:"failed", error:"You are not allowed to check out this page."});
    }
};

module.exports = authController;