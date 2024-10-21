const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

require("dotenv").config();
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()); //req.body

const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose
    .connect(mongoURI,{useNewUrlParser:true})
    .then(()=>console.log("mongoose connected"))
    .catch((err)=>console.log("DB connection failed", err));

app.listen(process.env.PORT || 5005, ()=>{
    console.log("server on");
})