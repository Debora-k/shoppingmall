const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const orderController = {}


orderController.createOrder = async(req,res) => {
    try{
        //프론트엔드에서 오더를 위한 데이터 보낸거 받아오기 
        const {userId} = req;
        const {shipTo, contact, totalPrice, orderList} = req.body;

        //재고확인하고 재고 업데이트
        const insufficientStockItems = await productController.checkItemStock(orderList);

        if(insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total,item)=> total += item.mesage, "");
            throw new Error(errorMessage);
        }
        
        //오더를 만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items: orderList,
            orderNum:randomStringGenerator()
        });

        await newOrder.save();
        res.status(200).json({status:"success",orderNum:newOrder.orderNum});
    } catch(error){
        return res.status(400).json({status:"failed",error:error.message});
    }
};

module.exports = orderController;