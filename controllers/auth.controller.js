const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const JWT_SECRET_KEY= process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

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

authController.loginWithGoogle = async (req,res) => {
    try{
        const {token} = req.body;
        const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await googleClient.verifyIdToken({
            idToken:token,
            //audience:GOOGLE_CLIENT_ID,
        });
        const {email,name} = ticket.getPayload();

        let user = await User.findOne({email});
        if(!user){
            // while creating a user by google, need to add random password(required) otherwise DB throws an error
            const randomPassword = "" + Math.floor(Math.random()*1000000);
            const salt = await bcrypt.genSalt(10);
            const newPassword = await bcrypt.hash(randomPassword,salt);
            user = new User({
                name,
                email,
                password:newPassword
            });
            await user.save();
        }
        // token
        const sessionToken = await user.generateToken();
        res.status(200).json({status:"success", user, token:sessionToken});
    } catch(error) {
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
        console.log(error);
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