import React from 'react'
import {Link} from 'react-router-dom'
import CategoriesPage from './CategoriesPage'

function CategoryItem({name, href, backgroundColor, color}){
    const style = {
        backgroundColor : backgroundColor,
        color : color,
        borderColor : color,
    }
    return(
        <div>
            <Link to={href} className='rounded-full'>
            <div className='uppercase px-6 py-2 text-center rounded-full' style={style}>{name}</div>
            </Link>
        </div>
    )
}


function CategoryList(){
    return (
        <div className='flex flex-wrap items-center justify-center gap-8'>
            <CategoryItem  name="entress" href="/categories/entress" backgroundColor="#f0f5c4" color="#59871f"/>
            <CategoryItem  name="breakfast" href="/categories/breakfast" backgroundColor="#efedfa" color="#3c3a8f"/>
            <CategoryItem  name="lunch" href="/categories/lunch" backgroundColor="#e5f7f3" color="#1f8787"/>
            <CategoryItem  name="desserts" href="/categories/desserts" backgroundColor="#e8f5f3" color="#397a9e"/>
            <CategoryItem  name="snacks" href="/categories/snacks" backgroundColor="#feefc9" color="#d16400"/>
            <CategoryItem  name="drinks" href="/categories/drinks" backgroundColor="#f0f5c4" color="#59871f"/>
            <CategoryItem  name="dinner" href="/categories/dinner" backgroundColor="#efedfa " color="#3c3a8d"/>
        </div>
    )
}

const Categories = () => {
  return (
    <div>
        <CategoryList/>
    </div>
  )
}

export default Categories
