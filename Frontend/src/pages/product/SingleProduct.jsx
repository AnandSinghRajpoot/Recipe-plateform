import React from 'react'
import { useLoaderData } from 'react-router-dom'

const SingleProduct = () => {
  const item = useLoaderData()
  console.log("Ingredients array:", item?.ingredients)
  console.log("More data:", item?.more)

  // Handle "more" object safely (it's an array in your data)
  const more = Array.isArray(item?.more) ? item.more[0] : item.more || {}

  // Extract time numbers safely
  const extractNumber = (timeString) => {
    if (!timeString) return 0
    const timeArray = timeString.split(" ")
    return parseInt(timeArray[0]) || 0
  }

  const prepTimeMinutes = extractNumber(more.prep_time)
  const cookTimeMinutes = extractNumber(more.cook_time)
  const totalTimeMinutes = prepTimeMinutes + cookTimeMinutes

  // Split instructions into numbered steps
  const steps =
    typeof item?.instructions === "string"
      ? item.instructions.split(/\d+\.\s*/).filter((s) => s.trim() !== "")
      : []

  return (
    <section className="min-h-dvh md:flex justify-center items-center md:bg-eggshell">
      <article>
        <div className="bg-white md:my-10 md:py-8 pb-8 md:rounded-xl">
          {/* 🖼️ Image */}
          <picture>
            <img
              src={item.thumbnail_image}
              alt={item.name}
              className="md:max-w-[90%] w-full md:h-[570px] md:rounded-xl md:mx-auto object-cover"
            />
          </picture>

          {/* 📋 Details */}
          <div className="px-8">
            <h1 className="text-4xl mt-12 text-secondary font-bold">
              {item.name}
            </h1>

            {item.description ? (
              <p className="mt-3 text-gray-700">{item.description}</p>
            ) : (
              <p className="mt-3 text-gray-600">
                A delicious and easy recipe, perfect for any meal.
              </p>
            )}

            {/* 🕒 Preparation Time */}
            {(more.prep_time || more.cook_time) && (
              <article className="bg-rose-50 mt-6 p-5 rounded-xl">
                <h3 className="text-xl font-semibold ml-2">Preparation Time</h3>
                <ul className="list-disc mt-3 ml-8 text-lg marker:text-orange-300">
                  {totalTimeMinutes > 0 && (
                    <li>
                      <span className="font-medium">Total:</span> {totalTimeMinutes} minutes
                    </li>
                  )}
                  {more.prep_time && (
                    <li>
                      <span className="font-medium">Preparation:</span> {more.prep_time}
                    </li>
                  )}
                  {more.cook_time && (
                    <li>
                      <span className="font-medium">Cooking:</span> {more.cook_time}
                    </li>
                  )}
                </ul>
              </article>
            )}

            {/* 🧂 Ingredients */}
            {item?.ingredients?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold ml-2">Ingredients</h3>
                <ul className="list-disc marker:text-black mt-4 ml-6 text-gray-800">
                  {item.ingredients.map((ingredient) => (
                    <li key={ingredient._id} className="pl-4 mt-2">
                      <span className="font-medium">{ingredient.name}</span>:{" "}
                      <span>{ingredient.quantity}</span>
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
                  {more.difficulty && <li>Difficulty: {more.difficulty}</li>}
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
