import React from 'react'

const NewsLetter = () => {
  return (
    <div className='w-full md:w-2/3 mx-auto flex flex-col items-center p-10'>
      <h3 className='text-secondary font-semibold text-center text-4xl'>Sign up for my weekly newletter!</h3>
      <p className='mt-6 text-gray-600 text-lg text-center leading-normal font-light'>Weekly emails with latest recipes, cooking tips and tricks and product recommendation! <br />You'll be set up in minutes.</p>
      <div className='mt-6 flex flex-col md:flex-row items-center justify-center w-full md:px-8 gap-4 mb-20'>
        <input type="text" placeholder='name' className='flex flex-grow px-4 py-4 rounded text-gray-400 outline-none placeholder:text-[#1b2629]' />
        <input type="text" placeholder='Email Address' className='flex flex-grow px-4 py-4 rounded text-gray-400 outline-none placeholder:text-[#1b2629]' />

        {/* <button className=' mt-2 md:mt-0 md:ml-2 bg-btnColor hover:text-secondary outline-none hover:border hover:border-btnColor hover:bg-[#f9f7f3] text-white shadow-lg rounded px-8 py-4'>
                    Get Started
        </button> */}

               <button
  className="mt-2 md:mt-0 md:ml-2 text-white font-bold text-base rounded-lg border border-orange-600 
             bg-orange-500 hover:bg-orange-600 transition-colors duration-200 ease-in-out shadow-lg px-8 py-4 "
>
  Get Started
</button>
      </div>
    </div>
    
  )
}

export default NewsLetter
