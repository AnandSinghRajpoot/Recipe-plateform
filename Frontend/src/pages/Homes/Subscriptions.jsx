import React from 'react'

const Subscriptions = () => {
  return (
    <div className='bg-white py-16 rounded-t-md'>
        <div className='max-w-screen-xl mx-auto px-6 lg:px-8 mb-20'>
            <div className='flex felx-col md:flex-row justify-between items-center gap-20'>
                <div className='md:w-1/2'>
                    <h3 className='text-3xl font-bold tracking-tight text-secondary sm:text-4xl'>Subscribe to our newsletter</h3>
                    <p className='mt-4 text-lg leading-8'>Stay connected with Recipe Hub and never miss a delicious update! Subscribe to our newsletter to receive the latest recipes and expert advice to make every meal more exciting.</p>
                </div>
                <div className='sm:w-1/2 mt-6 flex flex-col sm:flex-row gap-4'>
                <label htmlFor="email-address" className='sr-only'>
                    Email address
                </label>
                <input type="email" id='email-address' name='email' required placeholder='Enter your email' className='flex-auto rounded-md border-0 bg-primary px-3.5 py-4 text-white shadow-sm sm:text-sm sm:leading-6 focus:outline-btnColor'autoComplete='email' />

                {/* <button className=' mt-2 md:mt-0 md:ml-2 bg-btnColor hover:text-secondary outline-none hover:border hover:border-btnColor hover:bg-[#fffaf5] text-white shadow-lg rounded px-8 py-4'>
                    Subscribe
                </button> */}
                <button
  className="mt-2 md:mt-0 md:ml-2 text-white font-bold text-base rounded-lg border border-orange-600 
             bg-orange-500 hover:bg-orange-600 transition-colors duration-200 ease-in-out shadow-lg px-8 py-4"
>
  Subscribe
</button>


                 </div>
            </div>

        </div>
      
    </div>
  )
}

export default Subscriptions
