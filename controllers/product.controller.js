const Product = require("../models/Product");
const PAGE_SIZE=10;

const productController = {};
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
        const {page,name} =req.query;
        const condition = name?{name:{$regex:name, $options:"i"}}:{}
        let query = Product.find(condition).sort({sku:1});
        let response = {status:"success"};
        if(page){
            // PAGE_SIZE is for counting items per page 
            query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);

            //최종 몇 페이지
            // 데이터가 총 몇개 있는지
            // 데이터 총 갯수/PAGE_SIZE
            const totalItemNum = await Product.find(condition).countDocuments();
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }
        const productList = await query.exec(); // 쿼리를 따로 실행시키는 방법
        response.data = productList;

        res.status(200).json(response);
    }catch(error){
        res.status(400).json({status:"failed", error:"Something went wrong! Please refresh the page."});
    }
};

module.exports=productController;