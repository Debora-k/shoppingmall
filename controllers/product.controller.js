const Product = require("../models/Product");
const PAGE_SIZE=10;

const productController = {};
productController.createProduct = async(req,res) => {
    try{
        const {sku,name,size,image,category,description,price,stock,status}= req.body;
        if(price <= 0) throw new Error("Price cannot be zero or negative");
        if(description.trim()==="") throw new Error("Description shouldn't be empty!");
        if(name.trim()==="") throw new Error("Name shouldn't be empty!"); 
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
        if (error.message === "Price cannot be zero or negative" || 
            error.message=== "Description shouldn't be empty!" || 
            error.message==="Name shouldn't be empty!" 
        ) {
            res.status(400).json({status:"failed", error:error.message});
        }else {
            res.status(400).json({status:"failed", error:error});
        }
    }
};

productController.getProducts = async(req,res) => {
    try{
        const {page,name} =req.query;
        const condition = name ?
            { 
                name: {$regex:name, $options:"i"},
                isDeleted: false
            }
        :
            { 
                isDeleted: false 
            }
        let query = Product.find(condition).sort({createdAt:-1});
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

productController.updateProduct = async(req,res) => {
    try{
        const productId = req.params.id; //from product.api
        const {sku, name, size, image, price, description, category, stock, status} = req.body;
        if(price <= 0) throw new Error("Price cannot be zero or negative");
        if(description.trim()==="") throw new Error("Description shouldn't be empty!");
        if(name.trim()==="") throw new Error("Name shouldn't be empty!"); 
        
        const product = await Product.findByIdAndUpdate(
            {_id:productId},
            {sku, name, size, image, price, description, category, stock, status},
            {new: true} // to get edit info from users
        );
        if(!product) throw new Error("The item doesn't exist.");
        res.status(200).json({status:"success", data:product});
    }catch(error){
        if (error.message === "Price cannot be zero or negative" || 
            error.message=== "Description shouldn't be empty!" || 
            error.message==="Name shouldn't be empty!" ) {
            res.status(400).json({status:"failed", error:error.message});
        } else {
            res.status(400).json({status:"failed", error:error});
        }
    }
};

productController.deleteProduct = async(req,res) => {
    try{
        const productId = req.params.id;
        const product = await Product.findByIdAndUpdate(
            {_id:productId},
            {isDeleted:true}
        );
        if(!product) throw new Error("The item doesn't exist.");
        res.status(200).json({status:"success"});
    } catch(error){
        res.status(400).json({status:"failed", error:"Something went wrong! Please refresh the page."});
    }
};

productController.getProductById = async (req,res) => {
    try{
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if(!product) throw new Error("The item doesn't exist.");
        res.status(200).json({staus:"success", data:product});
    }catch(error){
        res.status(400).json({status:"failed", error:"Something went wrong! Please refresh the page."});
    }
}

module.exports=productController;