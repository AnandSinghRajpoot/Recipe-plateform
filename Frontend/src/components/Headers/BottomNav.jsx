import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/recipes", label: "Explore", icon: "explore" },
    { path: "/recipes", label: "Saved", icon: "bookmark" },
    { path: "/profile", label: "Profile", icon: "person" }
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-outline-variant/10 px-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-2 px-4 transition-all ${
              isActive(item.path) 
                ? "text-primary" 
                : "text-on-surface-variant"
            }`}
          >
            <span className={`material-symbols-outlined text-2xl transition-transform ${
              isActive(item.path) ? "scale-110" : ""
            }`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
              isActive(item.path) ? "text-primary" : ""
            }`}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"></div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;