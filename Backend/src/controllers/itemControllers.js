
const Item = require("../models/itemModels");

const getAllItems = async (req,res)=> {

    try{
    const result = await Item.find().sort({createdAt: -1});
    // res.status(201).json(result);
    res.setHeader("Content-Type", "application/json");
    return res.send(JSON.stringify(result, null, 2));
}
catch(error){
    return res.status(500).json({message : "error fetching items", error})
}
};



const getSearchedItems = async (req,res) => {
    const {q} = req.query;
    try{
        let items;
        if(q && q.trim() !== ""){
            items = await Item.find({name : {$regex : q, $options :'i'}})
        }
        else {
      
      items = await Item.find();
    }
        res.status(200).json(items);
    }
        catch(error){
            res.status(500).json({message : "no item found!"})
        }
    }

const getSingleItem = async(req,res) => {
    const {id} = req.params;
    try {
        const item = await Item.findById(id);
        res.json(item);
    }
    catch(error){
        res.status(500).json({message : 'no items found'})
    }
}
module.exports = {
    getAllItems,
    getSearchedItems,
    getSingleItem
}