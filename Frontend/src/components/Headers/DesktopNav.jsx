import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const DesktopNav = ({ menuItems, Logo }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isChef = role === "CHEF" || role === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/recipes/search?q=${searchQuery}`, {
          timeout: 3000
        });
        const data = res.data.data || res.data;
        setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        setSuggestions([]);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSuggestionClick = (item) => {
    saveRecentSearch(item.title);
    navigate(`/items/${item.id}`);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleRecentClick = (query) => {
    setSearchQuery(query);
    navigate(`/recipes?q=${encodeURIComponent(query)}`);
    setShowDropdown(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
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
        <div ref={searchRef} className="relative hidden lg:block">
          <form onSubmit={handleSearch} className="flex items-center bg-surface-container-high/50 px-5 py-2.5 rounded-2xl gap-3 border border-outline-variant/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-lg transition-all">
            <button type="submit" className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-on-surface w-40 placeholder:text-outline-variant/60 outline-none" 
              placeholder="Search recipes..." 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </form>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden z-50">
              {suggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Suggestions</div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full px-4 py-2 text-left hover:bg-surface-container-low flex items-center gap-3 transition-colors"
                    >
                      {item.coverImageUrl && (
                        <img src={item.coverImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-bold text-on-surface">{item.title}</div>
                        {item.category && <div className="text-xs text-on-surface-variant">{item.category}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div className={`py-2 ${suggestions.length > 0 ? 'border-t border-outline-variant/10' : ''}`}>
                  <div className="px-4 py-1 text-[10px] font-black uppercase text-on-surface-variant tracking-widest flex justify-between items-center">
                    Recent
                    <button onClick={clearRecentSearches} className="text-xs text-error hover:underline">Clear</button>
                  </div>
                  {recentSearches.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentClick(query)}
                      className="w-full px-4 py-2 text-left hover:bg-surface-container-low flex items-center gap-3 transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant">history</span>
                      <span className="text-sm font-bold text-on-surface">{query}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length < 2 && suggestions.length === 0 && recentSearches.length === 0 && (
                <div className="px-4 py-4 text-center text-sm text-on-surface-variant">
                  Type at least 2 characters for suggestions
                </div>
              )}
            </div>
          )}
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

