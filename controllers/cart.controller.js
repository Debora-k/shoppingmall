const Cart = require("../models/Cart");

const cartController = {}

cartController.addItemToCart = async(req,res)=> {
    try{
        const {userId} = req;
        const {productId,size,qty} = req.body;
        let cart = await Cart.findOne({userId});
        if(!cart) {
            cart = new Cart({userId});
            await cart.save();
        }
        // how to check whether the item & size are already existed in the cart
        const existItem = cart.items.find((item)=>item.productId.equals(productId)&& item.size === size);
        if(existItem) {
            throw new Error("This item is already in your cart!");
        }
        cart.items = [...cart.items,{productId,size,qty}];
        await cart.save();
        res.status(200).json({status:"success", data:cart, cartItemQty:cart.items.length});
    } catch(error){
        return res.status(400).json({status:"failed", error:error.message});
    }
};

module.exports=cartController;