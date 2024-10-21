const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// sign up
router.post("/",userController.createUser);

module.exports = router;