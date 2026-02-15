import React from "react";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import { RiCloseCircleLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

export const MobileNav = ({ menuItems, Logo, onClose, hideLeft, onOpen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // 

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    navigate("/login");
    onClose();
  };

  return (
    <div className="h-18 flex justify-between items-center px-6 lg:px-12">
      <a href="/">
        <img
          src={Logo}
          alt="logo"
          style={{ width: 200 }}
          className="object-contain"
        />
      </a>

      <button onClick={onOpen} className="border border-primary rounded">
        <HiOutlineBars3BottomRight className="w-7 h-7" />
      </button>

      {/* Sidebar Menu */}
      <div
        className={`transition-all w-full h-full fixed bg-primary z-50 top-0 ${hideLeft} flex justify-center items-center`}
      >
        <button onClick={onClose} className="absolute right-8 top-32">
          <RiCloseCircleLine className="w-7 h-7" />
        </button>

        {/* Menu Links */}
        <div>
          <ul className="flex flex-col gap-5">
            {menuItems?.map((menu, index) => (
              <li key={index}>
                <Link
                  to={menu === "home" ? "/" : menu === "recipe" ? "/recipes" : menu === "resource" ? "/resources" : `/${menu}`}
                  onClick={onClose}
                  className="font-medium capitalize text-secondary text-2xl"
                >
                  {menu}
                </Link>
              </li>
            ))}
          </ul>

          
          <ul className="flex items-center gap-4 font-medium mt-10 justify-center">
            {!token ? (
              <>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="text-secondary px-4 py-2 rounded border hover:bg-gray-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="text-secondary px-4 py-2 rounded border hover:bg-gray-200"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Link
                  to="/addRecipe"
                  onClick={onClose}
                  className="bg-orange-500 text-white px-8 py-2 rounded hover:bg-orange-600 transition"
                >
                  Add Recipe
                </Link>
                <Link
                  to="/my-recipes"
                  onClick={onClose}
                  className="text-secondary px-8 py-2 rounded border hover:bg-gray-200 w-full text-center"
                >
                  My Recipes
                </Link>
                <Link
                  to="/profile/complete"
                  onClick={onClose}
                  className="text-secondary px-8 py-2 rounded border hover:bg-gray-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-orange-500 text-white px-8 py-2 rounded hover:bg-orange-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
