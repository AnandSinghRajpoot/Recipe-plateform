import React from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
    { name: "Entrees", href: "/categories/entress", icon: "restaurant_menu" },
    { name: "Breakfast", href: "/categories/breakfast", icon: "sunny" },
    { name: "Lunch", href: "/categories/lunch", icon: "lunch_dining" },
    { name: "Desserts", href: "/categories/desserts", icon: "icecream" },
    { name: "Snacks", href: "/categories/snacks", icon: "tapas" },
    { name: "Drinks", href: "/categories/drinks", icon: "local_bar" },
    { name: "Dinner", href: "/categories/dinner", icon: "dinner_dining" },
];

function CategoryItem({ name, href, icon }) {
    return (
        <Link to={href} className='group flex flex-col items-center gap-4 transition-all duration-500'>
            <div className='w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-white border border-outline-variant/10 flex items-center justify-center text-primary-fixed shadow-md group-hover:vitality-gradient group-hover:text-white group-hover:shadow-[0_20px_40px_rgba(0,110,28,0.2)] group-hover:-translate-y-2 transition-all duration-500'>
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <span className='text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-primary transition-colors'>
                {name}
            </span>
        </Link>
    )
}

function CategoryList() {
    return (
        <div className='flex flex-wrap items-center justify-center gap-10 md:gap-16'>
            {CATEGORIES.map((cat, idx) => (
                <CategoryItem key={idx} {...cat} />
            ))}
        </div>
    )
}

const Categories = () => {
    return (
        <div className="py-8">
            <CategoryList />
        </div>
    )
}

export default Categories
