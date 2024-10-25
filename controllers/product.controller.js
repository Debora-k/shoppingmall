const productController = {};
const Product = require("../models/Product");

productController.createProduct = async(req,res) => {
    try{
        const {sku,name,size,image,category,description,price,stock,status}= req.body;
        const product = new Product({
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status
        });
        await product.save();
        res.status(200).json({status:"success", product});
    } catch(error) {
        res.status(400).json({status:"failed", error:"Failed to create the product. Try again."});
    }
};

productController.getProducts = async(req,res) => {
    try{
        const products = await Product.find({});
        res.status(200).json({status:"success", data:products});
    }catch(error){
        res.status(400).json({status:"failed", error:"Something went wrong! Please refresh the page."});
    }
};

module.exports=productController;