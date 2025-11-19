import React, { useState } from "react";

const AddRecipe = () => {
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    image: "",
  });

  const [recipes, setRecipes] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setRecipe({ ...recipe, image: URL.createObjectURL(files[0]) });
    } else {
      setRecipe({ ...recipe, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipe.title || !recipe.image) {
      alert("Please add at least a title and image!");
      return;
    }
    setRecipes([...recipes, recipe]);
    setRecipe({
      title: "",
      description: "",
      ingredients: "",
      steps: "",
      image: "",
    });
  };

  return (
    <div className="bg-[#FFFDF7] min-h-screen py-10 px-5">
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-8">
        Add Your Own Recipe 🍲
      </h1>

      {/* Recipe Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6"
      >
        <div>
          <label className="block font-semibold mb-2">Recipe Title</label>
          <input
            type="text"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            placeholder="Enter recipe name"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={recipe.description}
            onChange={handleChange}
            placeholder="Short recipe description..."
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Ingredients</label>
          <textarea
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            placeholder="List ingredients (comma separated)"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-orange-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Preparation Steps</label>
          <textarea
            name="steps"
            value={recipe.steps}
            onChange={handleChange}
            placeholder="Step-by-step instructions"
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Upload Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Add Recipe
        </button>
      </form>

      {/* Recipe Preview List */}
      <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((r, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl overflow-hidden  transition"
          >
            <img
              src={r.image}
              alt={r.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2 text-orange-700">
                {r.title}
              </h2>
              <p className="text-gray-600 mb-2">{r.description}</p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Ingredients:</strong> {r.ingredients}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Steps:</strong> {r.steps}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddRecipe;
