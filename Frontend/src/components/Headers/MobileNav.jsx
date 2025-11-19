import React from "react";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import { RiCloseCircleLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

export const MobileNav = ({ menuItems, Logo, onClose, hideLeft, onOpen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // 

  const handleLogout = () => {
    localStorage.removeItem("token"); // 
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
                  to={`/${menu}`}
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
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="text-secondary px-4 py-2 rounded border hover:bg-gray-200"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-secondary px-4 py-2 rounded border hover:bg-gray-200"
              >
                Logout
              </button>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
