const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
        res.status(400).json({status:"failed", error:error.message});
    }
};

module.exports = authController;