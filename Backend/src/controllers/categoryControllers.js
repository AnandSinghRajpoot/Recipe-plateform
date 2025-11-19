const Category = require("../models/categoryModel");
const Item = require("../models/itemModels");

// Get items by category name
const getCategory = async (req, res) => {
  const { category } = req.params;

  try {
    // Find all items matching category (case-insensitive)
    const items = await Item.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (!items.length) {
      return res.status(404).json({ message: "No items found for this category" });
    }

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
};

module.exports = { getCategory };
