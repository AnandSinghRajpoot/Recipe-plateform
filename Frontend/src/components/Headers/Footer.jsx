import React from 'react'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaGithub, FaDribbble } from "react-icons/fa";



const Footer = () => {
  return (
 <footer className="bg-[#faf8f6] text-gray-700 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">

        {/* Brand Section */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-black mb-3">Recipe Hub
            
          </h2>
          <p className="text-sm leading-6 text-gray-600 mb-5">
            Discover delicious recipes, explore new cuisines, and make cooking a joyful experience every day.
          </p>
          <div className="flex space-x-4 text-xl text-gray-600">
            <a href="#" className="hover:text-black"><FaFacebookF /></a>
            <a href="#" className="hover:text-black"><FaInstagram /></a>
            <a href="#" className="hover:text-black"><FaTwitter /></a>
            <a href="#" className="hover:text-black"><FaGithub /></a>
            <a href="#" className="hover:text-black"><FaDribbble /></a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-semibold text-black mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-black">Recipe Sharing</a></li>
            <li><a href="#" className="hover:text-black">Nutrition Tips</a></li>
            <li><a href="#" className="hover:text-black">Meal Planning</a></li>
            <li><a href="#" className="hover:text-black">Cooking Guides</a></li>
            <li><a href="#" className="hover:text-black">Diet Support</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-black mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-black">About</a></li>
            <li><a href="#" className="hover:text-black">Meet the Team</a></li>
            <li><a href="#" className="hover:text-black">Blog</a></li>
          </ul>
        </div>

        {/* Helpful Links */}
        <div>
          <h3 className="font-semibold text-black mb-4">Helpful Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-black">Contact</a></li>
            <li><a href="#" className="hover:text-black">FAQs</a></li>
            <li><a href="#" className="hover:text-black">Support</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-300 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Recipe Hub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer
