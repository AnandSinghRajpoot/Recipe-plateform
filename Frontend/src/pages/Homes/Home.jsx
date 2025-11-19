import React from 'react';
import Hero from "../../components/Headers/Hero";
import Categories from '../Category/Categories';
import FeaturedSection  from './FeaturedSection';
import LatestRecipe from './LatestRecipe';
import NewsLetter from './NewsLetter';
import AboutSection from './AboutSection';
import CompanyLogo from './CompanyLogo';
import Subscriptions from './Subscriptions';

const Home = () => {
    return (
        <div className="container mx-auto">
            <div className="flex flex-col justify-center items-center w-full py-20">
            <Hero/>
            <Categories/>
            </div>

            {/* other components */}
            <FeaturedSection/>
            <LatestRecipe/>
            <NewsLetter/>
            <AboutSection/>
            <CompanyLogo/>
            <Subscriptions/>
        </div>
    )
}

export default Home;