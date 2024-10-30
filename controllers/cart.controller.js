const Cart = require("../models/Cart");
const Product = require("../models/Product");

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
        return res.status(400).json({status:"failed", error:"Something went wrong. Please try again"});
    }
};

cartController.getCart = async(req,res) => {
    try{
        const {userId} = req; //from middleware
        let cart = await Cart.findOne({userId});
        if(!cart) {
            cart = new Cart({userId});
            await cart.save();
        }
        await cart.populate({
            path:"items",
            populate:{
                path:"productId",
                model:"Product",
            }
        });
        res.status(200).json({status:"success", data:cart.items});
    } catch(error){
        return res.status(400).json({status:"failed", error:error.message});
    }
};

cartController.deleteCartItem = async(req,res) => {
    try{
        const {userId} = req; 
        const {id} = req.params;
        let cart = await Cart.findOne({userId});
        cart.items.id(id).deleteOne();
        await cart.save();
        res.status(200).json({status:"success", data:cart.items, cartItemQty:cart.items.length});
    } catch(error){
        return res.status(400).json({status:"failed", error:error.message});
    }
};

cartController.updateQty = async(req,res) => {
    try{
        const {userId} = req;
        const {size, qty} = req.body;
        const {id} = req.params;
        let cart = await Cart.findOne({userId});
        if(!cart) throw new Error("There is no cart for this user.");
        const item = cart.items.find((i)=>i._id.equals(id));
        const product = await Product.findById(item.productId);
        
        if(qty > product.stock[size]) {
            throw new Error("Sorry, there is not enough stock.");
        }
        item.qty = qty;
        await cart.save();
        res.status(200).json({status:"success", data:cart.items, cartItemQty:cart.items.length});
    }catch(error){
        return res.status(400).json({status:"failed", error:error.message});
    }
};

module.exports=cartController;