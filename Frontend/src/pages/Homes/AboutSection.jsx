import React from 'react'
import AboutImg from '../../assets/about-image.jpg'
const AboutSection = () => {
  return (
    <div className='overflow-hidden flex md:flex-row flex-col justify-between items-center sm:my-20 my-4 md:gap-20 gap-12 px-5 lg:px-10'>
          <div className='text-start sm:w-1/2'>
            <h2 className='text-3xl font-semibold text-secondary sm:text-5xl sm:leading-relaxed'>Vegan foodie who loves to experiment with recipes</h2>
            <p className='text-xl mt-4 text-[#5c5c5c]'>Welcome to Vegan Foodie — a delicious corner for plant-based enthusiasts who love to experiment in the kitchen! Explore creative vegan recipes that bring together bold flavors, nutritious ingredients, and easy-to-follow cooking steps. 
                <br/> Whether you're a beginner or a seasoned vegan cook, there’s something here to inspire your next meal.
            </p>
            <div className='lg:mt-0 lg:flex-shrink-0'>
                <div className='mt-12 inline-flex'>
                    {/* <button className=' mt-2 md:mt-0 md:ml-2 bg-btnColor hover:text-secondary outline-none hover:border hover:border-btnColor hover:bg-[#f9f7f3] text-white shadow-lg rounded px-8 py-4'>
                    View Recipe
        </button> */}
               <button
  className="mt-2 md:mt-0 md:ml-2 text-white font-bold text-base rounded-lg border border-orange-600 
             bg-orange-500 hover:bg-orange-600 transition-colors duration-200 ease-in-out shadow-lg px-8 py-4"
>
  View Recipe
</button>
                </div>
            </div>
          </div>
          <div>
            <img src={AboutImg} alt="Featured Img"  className='rounded-md'/>
          </div>
        </div>
  )
}

export default AboutSection
