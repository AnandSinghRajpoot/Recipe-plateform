import React from "react";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import { RiCloseCircleLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";

export const MobileNav = ({ menuItems, Logo, onClose, hideLeft, onOpen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isChef = role === "CHEF" || role === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out successfully!");
    navigate("/login");
    onClose();
  };

  return (
    <div className="fixed top-0 w-full z-50 bg-white border-b border-outline-variant/10 px-6 h-18 flex justify-between items-center transition-all shadow-sm">
      <Link to="/" onClick={onClose} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg vitality-gradient shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">restaurant</span>
        </div>
        <span className="text-xl font-headline font-black text-on-surface tracking-tighter">RecipeHub</span>
      </Link>

      <button 
        onClick={onOpen} 
        className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary hover:bg-white hover:shadow-md transition-all border border-outline-variant/5"
      >
        <HiOutlineBars3BottomRight className="w-6 h-6" />
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`transition-all duration-700 w-full h-full fixed inset-0 z-[100] ${hideLeft === 'left-0' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
        
        {/* Sidebar Menu Panel */}
        <div 
          className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 delay-100 flex flex-col p-8 border-l border-outline-variant/10 ${hideLeft === 'left-0' ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex justify-between items-center mb-12">
            <span className="text-2xl font-headline font-black text-on-surface tracking-tighter">Menu</span>
            <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
              <RiCloseCircleLine className="w-8 h-8" />
            </button>
          </div>

          <ul className="flex flex-col gap-6 flex-1">
            {menuItems?.map((menu, index) => (
              <li key={index}>
                <Link
                  to={menu === "recipe" ? "/recipes" : menu === "plan" ? "/meal-planner" : menu === "resource" ? "/resources" : `/${menu}`}
                  onClick={onClose}
                  className="text-2xl font-black capitalize text-on-surface-variant hover:text-primary transition-all flex items-center gap-4"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity"></span>
                  {menu}
                </Link>
              </li>
            ))}
          </ul>

          <div className="pt-10 border-t border-outline-variant/10 space-y-6">
            {!token ? (
              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full py-4 text-center text-on-surface font-black hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="w-full py-4 text-center vitality-gradient text-white font-black rounded-2xl shadow-xl shadow-primary/10"
                >
                  Join Community
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {isChef && (
                  <>
                    <Link
                      to="/chef-dashboard"
                      onClick={onClose}
                      className="w-full py-4 bg-primary text-white font-black rounded-2xl text-center shadow-lg flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm font-black">dashboard</span>
                      Chef Dashboard
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="w-full py-4 bg-surface-container-low text-on-surface-variant font-black rounded-2xl text-center border border-outline-variant/10"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 text-error font-black hover:bg-error/5 rounded-2xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-auto text-center opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">RecipeHub Eco</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
