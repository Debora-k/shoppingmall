const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const PAGE_SIZE = 5;
const orderController = {}


orderController.createOrder = async(req,res) => {
    try{
        //프론트엔드에서 오더를 위한 데이터 보낸거 받아오기 
        const {userId} = req;
        const {shipTo, contact, totalPrice, orderList} = req.body;

        await Order.db.transaction(async function (session) {
            //재고확인하고 재고 업데이트
            const insufficientStockItems = await productController.checkItemStock(orderList, session);

            if(insufficientStockItems.length > 0) {
                const errorMessage = insufficientStockItems.reduce((total,item)=> total += item.message, "");
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

            await newOrder.save({ session });
            res.status(200).json({status:"success",orderNum:newOrder.orderNum});
        });
    } catch(error){
        return res.status(400).json({status:"failed",error:error.message});
    }
};

orderController.getOrder = async(req,res) => {
    try{
        const {userId} = req;
        let query = Order.find({userId:userId}).sort({createdAt:-1});
        let response = {status:"success"};

        const orderList = await query.exec(); 
        response.data = orderList;
        res.status(200).json(response);
    }catch(error){
        return res.status(400).json({status:"failed",error:error.message});
    }
};

orderController.getOrderList = async(req,res) => {
    try{
        const {page,orderNum} =req.query;
        const condition = orderNum ?
            { 
                orderNum: {$regex:orderNum, $options:"i"},
            }:{};
        let query = Order.find(condition).sort({createdAt:-1});
        let response = {status:"success"};
        if(page){
            // PAGE_SIZE is for counting items per page 
            query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);

            //최종 몇 페이지
            // 데이터가 총 몇개 있는지
            // 데이터 총 갯수/PAGE_SIZE
            const totalItemNum = await Order.find(condition).countDocuments();
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }
        
        query.populate({
            path:"items",
            populate:{
                path:"productId",
                model:"Product",
            }
        });
        
        query.populate({
            path:"userId",
            model:"User",
        });
        
        const orderList = await query.exec(); 
        response.data = orderList;
        
        res.status(200).json(response);
    } catch(error){
        return res.status(400).json({status:"failed",error:error.message});
    }
};


orderController.updateOrder = async(req,res) => {
    try{
        const {status} = req.body;
        const orderId = req.params.id;
        const order = await Order.findByIdAndUpdate(
            {_id:orderId},
            {status},
            {new:true},
        );
        if(!order) throw new Error("Something went wrong!");
        res.status(200).json({status:"success", data:status});
    } catch(error){
        return res.status(400).json({status:"failed",error:error.message});
    }
};

module.exports = orderController;