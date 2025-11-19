import React from 'react'
import FeaturedImg from "../../assets/featured.webp"

const FeaturedSection = () => {
  return (
    <div className='overflow-hidden flex md:flex-row flex-col justify-between items-center sm:my-20 my-4 md:gap-20 gap-12 px-5 lg:px-10'>
      <div className='relative'>
        <div className='absolute top-4 left-4 bg-white text-secondary px-3 py-1 rounded-md uppercase tracking-wider'>Featured Recipe</div>
        {/* <img src={FeaturedImg} alt="Featured Img"  className='rounded-md'/> */}
        <img src="https://i.pinimg.com/1200x/6c/49/75/6c4975849b86618dd5ed769151e10d15.jpg"  width='800px' alt="Featured Img"  className='rounded-md'/>
      </div>
      <div className='text-start sm:w-1/2 '>
        <h2 className='text-3xl font-semibold text-secondary sm:text-5xl sm:leading-relaxed'>🧀Cottage Cheese <span>Wraps</span></h2>
        <p className='text-xl mt-4 text-[#5c5c5c]'>These wholesome Cottage Cheese Wraps make a perfect blend of flavor and nutrition. Soft whole-wheat tortillas are filled with creamy cottage cheese, fresh crunchy veggies, and a drizzle of herbed yogurt sauce. Packed with protein and fiber, this light yet satisfying meal keeps you energized without feeling heavy.<br/>
          <span>Perfect for a quick lunch, post-workout snack, or a healthy dinner, these wraps are simple to prepare and customizable — add your favorite greens, bell peppers, or a hint of chili flakes for extra zest!</span>
        </p>
        <div className='lg:mt-0 lg:flex-shrink-0'>
            <div className='mt-12 inline-flex'>
                {/* <button className='py-4 px-8 hover:bg-btnColor text-secondary hover:text-white w-full transition ease-in duration-200 text-center text-base font-semibold border border-[#9c702a] focus:outline-none rounded-lg'>
                    View Recipe
                </button> */}

                <button
  className="w-full py-4 px-8 text-white font-bold text-base rounded-lg border border-orange-600 
             bg-orange-500 hover:bg-orange-600 transition-colors duration-200 ease-in-out "
>
  View Recipe
</button>

            </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedSection
