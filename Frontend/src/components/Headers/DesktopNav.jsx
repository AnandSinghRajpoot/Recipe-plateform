import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DesktopNav = ({ menuItems, Logo }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isChef = role === "CHEF" || role === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-8 lg:px-12 h-20 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl vitality-gradient shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">restaurant</span>
        </div>
        <span className="text-2xl font-headline font-black text-on-surface tracking-tighter">RecipeHub</span>
      </Link>

      {/* Menu Navigation */}
      <ul className="hidden xl:flex gap-8">
        {menuItems?.map((menu, index) => (
          <li key={index}>
            <Link
              to={menu === "recipe" ? "/recipes" : menu === "plan" ? "/meal-planner" : menu === "resource" ? "/resources" : `/${menu}`}
              className="text-sm font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all duration-300 relative group"
            >
              {menu}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full"></span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Action Zone: Search & Auth */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center bg-surface-container-high/50 px-5 py-2.5 rounded-2xl gap-3 border border-outline-variant/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-lg transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-on-surface w-40 placeholder:text-outline-variant/60 outline-none" 
            placeholder="Search recipes..." 
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/search?query=${e.target.value}`);
            }}
          />
        </div>

        <ul className="flex items-center gap-4 font-black">
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-on-surface-variant hover:text-primary px-4 py-2 text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="vitality-gradient text-white px-6 py-3 rounded-2xl text-sm shadow-xl shadow-primary/10 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                Get Started
              </Link>
            </>
          ) : isChef ? (
            /* Chef / Admin View: single dashboard link */
            <div className="flex items-center gap-4">
              <Link
                to="/chef-dashboard"
                className="vitality-gradient text-white px-6 py-3 rounded-2xl text-sm shadow-xl shadow-primary/10 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm font-black">dashboard</span>
                My Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-on-surface-variant hover:text-error px-2 py-2 transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          ) : (
            /* Regular User View */
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white hover:shadow-lg transition-all"
                title="Profile"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-on-surface-variant hover:text-error px-2 py-2 transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DesktopNav;

