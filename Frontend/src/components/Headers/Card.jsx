import React from 'react'
import {Link} from 'react-router-dom'
import { GoClock } from "react-icons/go";

const Card = ({item}) => {
    const categoryStyles = {
        Entress : {backgroundColor :"#f0f5c4", color:"#59871f"},
        Breakfast : {backgroundColor :"#efedfa", color:"#3c3a8f"},
        Lunch : {backgroundColor :"#e5f7f3", color:"#1f8787"},
        Desserts : {backgroundColor :"#e8f5fa", color:"#397a1f"},
        Snacks : {backgroundColor :"#feefc9", color:"#d16400"},
        Drinks : {backgroundColor :"#f0f5c4", color:"#59871f"},
        Dinner : {backgroundColor :"#efedfa", color:"#3c3a8f"},
        default : {backgroundColor : "#fff" , color: "#000"}
    };
    const getCategoryStyle = (category) => {
        return categoryStyles[category] || categoryStyles.default;
    }
    const categoryStyle = getCategoryStyle(item?.category)
    return (
        <div className="container mx-auto flex justify-center md:justify-start">
            <div className="max-w-sm">
                <div className='bg-white relative shadow-lg hover:shadow-xl transition duration-500 rounded-lg'>
                <img src={item?.thumbnail_image} alt={item.name || "Recipe"}  className="w-full h-48 object-cover rounded-t-xl"/>
                
                <div className="absolute top-2 right-2 py-1 px-2 bg-white rounded-lg shadow">
              <span className="font-medium text-gray-700 text-sm">
                {item?.more?.[0]?.difficulty || "N/A"}
              </span>
            </div>
                <div className='py-6 px-5 rounded-lg bg-white '>
                    <Link to= {`/items/${item._id}`}>
                    <h1 className='text-gray-500 font-bold text-2xl mb=8 hover:text-gray-900 hover:cursor-pointer'>{item?.name}</h1>
                    </Link>

                    <div className='flex justify-between items-center flex-wrap mt-6'>
                        <button className={'mt-6 py px-4 font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300'} style={{
                            backgroundColor : categoryStyle.backgroundColor,
                            color :categoryStyle.color,
                        }}>{item?.category}</button>

                        <div className='flex items-center py-2 mt-6 text-gray-500'>
                            <GoClock />
                            {/* <span className='ml-1'>{item?.prep_time}</span> */}
                            <span className='ml-1'>{item?.more?.[0]?.prep_time || "N/A"}</span>

                        </div>
                    </div>
                </div>

            
                </div>
                

                </div>

        </div>
    )
}

export default Card;