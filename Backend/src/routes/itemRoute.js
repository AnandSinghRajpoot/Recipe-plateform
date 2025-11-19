const express = require('express')
const router = express.Router();
const ItemControllers = require("../controllers/itemControllers")

router.get("/all-items", ItemControllers.getAllItems);
router.get("/items", ItemControllers.getSearchedItems);
router.get("/items/:id", ItemControllers.getSingleItem);

module.exports = router