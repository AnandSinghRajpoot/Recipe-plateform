const express = require('express');
const router = express.Router()

const CategoryController = require("../controllers/categoryControllers")

router.get('/categories/:category', CategoryController.getCategory)

module.exports = router