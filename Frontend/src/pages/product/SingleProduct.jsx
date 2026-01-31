import React from 'react'
import { useLoaderData } from 'react-router-dom'

const SingleProduct = () => {
  const item = useLoaderData()
  
  // Property mapping from DTO or legacy data
  const title = item?.title || item?.name || "Untitled Recipe";
  const description = item?.description || "A delicious recipe.";
  const instructions = item?.instructions || "";
  const imageUrl = item?.coverImageUrl || item?.thumbnail_image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2000&auto=format&fit=crop";
  const difficulty = item?.difficulty || (Array.isArray(item?.more) ? item.more[0]?.difficulty : item?.more?.difficulty) || "N/A";
  
  // Time handling (new numeric fields vs old strings)
  const more = Array.isArray(item?.more) ? item.more[0] : item.more || {}
  
  const extractNumber = (timeString) => {
    if (typeof timeString === 'number') return timeString;
    if (!timeString || typeof timeString !== 'string') return 0
    const timeArray = timeString.split(" ")
    return parseInt(timeArray[0]) || 0
  }

  const prepTime = item?.prepTime !== undefined ? item.prepTime : extractNumber(more.prep_time);
  const cookTime = item?.cookTime !== undefined ? item.cookTime : extractNumber(more.cook_time);
  const totalTime = prepTime + cookTime;

  // Split instructions into numbered steps
  const steps =
    typeof instructions === "string"
      ? instructions.split(/\d+\.\s*|\n/).filter((s) => s.trim() !== "")
      : []

  return (
    <section className="min-h-dvh md:flex justify-center items-center md:bg-eggshell">
      <article>
        <div className="bg-white md:my-10 md:py-8 pb-8 md:rounded-xl">
          {/* 🖼️ Image */}
          <picture>
            <img
              src={imageUrl}
              alt={title}
              className="md:max-w-[90%] w-full md:h-[570px] md:rounded-xl md:mx-auto object-cover"
            />
          </picture>

          {/* 📋 Details */}
          <div className="px-8">
            <h1 className="text-4xl mt-12 text-secondary font-bold">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 text-gray-700">{description}</p>
            ) : (
              <p className="mt-3 text-gray-600">
                A delicious and easy recipe, perfect for any meal.
              </p>
            )}

            {/* 🕒 Preparation Time */}
            {(prepTime > 0 || cookTime > 0) && (
              <article className="bg-rose-50 mt-6 p-5 rounded-xl">
                <h3 className="text-xl font-semibold ml-2">Preparation Time</h3>
                <ul className="list-disc mt-3 ml-8 text-lg marker:text-orange-300">
                  {totalTime > 0 && (
                    <li>
                      <span className="font-medium">Total:</span> {totalTime} minutes
                    </li>
                  )}
                  {prepTime > 0 && (
                    <li>
                      <span className="font-medium">Preparation:</span> {prepTime} minutes
                    </li>
                  )}
                  {cookTime > 0 && (
                    <li>
                      <span className="font-medium">Cooking:</span> {cookTime} minutes
                    </li>
                  )}
                  <li>
                    <span className="font-medium">Difficulty:</span> {difficulty}
                  </li>
                </ul>
              </article>
            )}

            {/* 🧂 Ingredients */}
            {item?.ingredients?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold ml-2">Ingredients</h3>
                <ul className="list-disc marker:text-black mt-4 ml-6 text-gray-800">
                  {item.ingredients.map((ingredient, index) => (
                    <li key={ingredient.id || ingredient._id || index} className="pl-4 mt-2">
                      <span className="font-medium">{ingredient.name}</span>:{" "}
                      <span>{ingredient.quantity} {ingredient.unit || ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 🍳 Instructions */}
            {steps.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold ml-2">Instructions</h3>
                <ol className="list-decimal ml-8 mt-4 space-y-2 text-gray-800">
                  {steps.map((step, index) => (
                    <li key={index}>{step.trim()}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* 🍽 Nutrition Facts */}
            {(more.calories || more.protein || more.carbs || more.fat) && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold ml-2">Nutrition Facts</h3>
                <ul className="list-disc marker:text-green-500 mt-4 ml-6 text-secondary">
                  {more.calories && <li>Calories: {more.calories}</li>}
                  {more.protein && <li>Protein: {more.protein}</li>}
                  {more.carbs && <li>Carbs: {more.carbs}</li>}
                  {more.fat && <li>Fat: {more.fat}</li>}
                  {more.servings && <li>Servings: {more.servings}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}

export default SingleProduct
