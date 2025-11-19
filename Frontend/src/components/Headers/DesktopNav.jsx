import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DesktopNav = ({ menuItems, Logo }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // ✅ check if logged in

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="h-18 flex items-center justify-between lg:px-12">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src={Logo}
          alt="logo"
          style={{ width: 200 }}
          className="object-contain"
        />
      </Link>

      {/* Menu Items */}
      <ul className="gap-7 flex">
        {menuItems?.map((menu, index) => (
          <li key={index}>
            <Link
              to={`/${menu}`}
              className="font-medium capitalize text-secondary hover:text-orange-600 transition"
            >
              {menu}
            </Link>
          </li>
        ))}
      </ul>

      {/* ✅ Auth Buttons */}
      <ul className="flex items-center gap-4 font-medium">
        {!token ? (
          <>
            <Link
              to="/login"
              className="text-secondary px-4 py-2 rounded border"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-secondary px-4 py-2 rounded border"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="text-secondary px-4 py-2 rounded border hover:bg-gray-100"
          >
            Logout
          </button>
        )}
      </ul>
    </div>
  );
};

export default DesktopNav;
