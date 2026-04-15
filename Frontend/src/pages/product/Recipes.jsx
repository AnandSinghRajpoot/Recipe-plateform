import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard.jsx";
import { HorizontalRecipeListSkeleton } from '../../components/common/LoadingSkeleton';
import LottiePlayer from '../../components/common/LottiePlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearchOutline } from 'react-icons/io5';

const Recipes = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);
    const [cache, setCache] = useState(new Map());
    const [filters, setFilters] = useState({
        diet: searchParams.get('diet') || '',
        difficulty: searchParams.get('difficulty') || '',
        level: searchParams.get('level') || '',
        category: searchParams.get('category') || '',
        prepTime: searchParams.get('prepTime') || ''
    });
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [showFilters, setShowFilters] = useState(false);
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

    const saveRecentSearch = (query) => {
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    const handleSuggestionClick = (item) => {
        saveRecentSearch(item.title);
        navigate(`/items/${item.id}`);
        setShowDropdown(false);
    };

    const handleRecentClick = (query) => {
        setSearchQuery(query);
        const newParams = new URLSearchParams();
        newParams.set('q', query);
        if (filters.diet) newParams.set('dietType', filters.diet);
        if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
        if (filters.category) newParams.set('category', filters.category);
        if (filters.prepTime) newParams.set('cookingTime', filters.prepTime);
        setSearchParams(newParams);
        setVisibleCount(6);
        setShowDropdown(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    const dietTypes = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Dairy-Free', 'Nut-Free'];
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink'];
    const prepTimes = ['Under 15 min', '15-30 min', '30-60 min', 'Over 60 min'];
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    const fetchRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const query = searchParams.get('q') || "";
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (filters.diet) params.append('diet', filters.diet);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.level) params.append('level', filters.level);
            if (filters.category) params.append('category', filters.category);
            if (filters.prepTime) params.append('prepTime', filters.prepTime);

            const cacheKey = params.toString();
            
            if (cache.has(cacheKey)) {
                setItems(cache.get(cacheKey));
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/v1/recipes?${params.toString()}`, {
                timeout: 8000
            });
            const data = response.data.data || [];
            
            setCache(prev => new Map(prev).set(cacheKey, data));
            setItems(data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams, cache, filters]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        saveRecentSearch(searchQuery);
        const newParams = new URLSearchParams();
        if (searchQuery) newParams.set('q', searchQuery);
        if (filters.diet) newParams.set('dietType', filters.diet);
        if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
        if (filters.category) newParams.set('category', filters.category);
        if (filters.prepTime) newParams.set('cookingTime', filters.prepTime);
        setSearchParams(newParams);
        setVisibleCount(6);
        setShowDropdown(false);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const clearFilters = () => {
        setFilters({
            diet: '',
            difficulty: '',
            level: '',
            category: '',
            prepTime: ''
        });
        setSearchQuery('');
    };

    const hasActiveFilters = filters.diet || filters.difficulty || filters.level || filters.category || filters.prepTime || searchQuery;
    
    return (
        <div className='bg-surface min-h-screen px-4 lg:px-12 py-24 font-body relative overflow-hidden'>
            
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Back Button */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="text-sm font-bold">Back to Home</span>
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="text-2xl font-headline font-black text-on-surface">
                        Recipes
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-8 relative">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                        <div ref={searchRef} className="relative flex-1">
                            <div className="flex items-center bg-white rounded-2xl border border-outline-variant/10 px-4 shadow-sm">
                                <IoSearchOutline className="w-5 h-5 text-on-surface-variant" />
                                <input 
                                    type="text"
                                    placeholder="Search recipes..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchQuery(value);
                                        setShowDropdown(true);
                                        if (!value) {
                                            const newParams = new URLSearchParams();
                                            if (filters.diet) newParams.set('dietType', filters.diet);
                                            if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
                                            if (filters.category) newParams.set('category', filters.category);
                                            if (filters.prepTime) newParams.set('cookingTime', filters.prepTime);
                                            setSearchParams(newParams);
                                        }
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="flex-1 px-3 py-4 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                                />
                                {searchQuery && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSuggestions([]);
                                            const newParams = new URLSearchParams();
                                            if (filters.diet) newParams.set('dietType', filters.diet);
                                            if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
                                            if (filters.category) newParams.set('category', filters.category);
                                            if (filters.prepTime) newParams.set('cookingTime', filters.prepTime);
                                            setSearchParams(newParams);
                                        }}
                                        className="text-on-surface-variant hover:text-error"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>

                            {/* Dropdown */}
                            {showDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden z-50">
                                    {suggestions.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1 text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Suggestions</div>
                                            {suggestions.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
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
                                                <button type="button" onClick={clearRecentSearches} className="text-xs text-error hover:underline">Clear</button>
                                            </div>
                                            {recentSearches.map((query, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
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
                        <button 
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-4 rounded-2xl border font-bold text-sm transition-all ${showFilters || hasActiveFilters ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface border-outline-variant/10'}`}
                        >
                            Filters {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0)})`}
                        </button>
                        {hasActiveFilters && (
                            <button 
                                type="button"
                                onClick={clearFilters}
                                className="px-6 py-4 rounded-2xl bg-error/10 text-error font-bold text-sm hover:bg-error/20 transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </form>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-outline-variant/10 p-6 mt-4 space-y-6">
                                    {/* Diet Type */}
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-3">Diet Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {dietTypes.map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleFilterChange('diet', filters.diet === type ? '' : type)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.diet === type ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-3">Difficulty</label>
                                        <div className="flex flex-wrap gap-2">
                                            {difficulties.map(diff => (
                                                <button
                                                    key={diff}
                                                    onClick={() => handleFilterChange('difficulty', filters.difficulty === diff ? '' : diff)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.difficulty === diff ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
                                                >
                                                    {diff}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skill Level */}
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-3">Skill Level</label>
                                        <div className="flex flex-wrap gap-2">
                                            {levels.map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => handleFilterChange('level', filters.level === level ? '' : level)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.level === level ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-3">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.category === cat ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cooking Time */}
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-3">Prep Time</label>
                                        <div className="flex flex-wrap gap-2">
                                            {prepTimes.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => handleFilterChange('prepTime', filters.prepTime === time ? '' : time)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.prepTime === time ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSearch}
                                        className="w-full py-3 rounded-xl vitality-gradient text-white font-black text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {searchQuery && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                Search: {searchQuery}
                                <button onClick={() => setSearchQuery('')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.diet && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.diet}
                                <button onClick={() => handleFilterChange('diet', '')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.difficulty && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.difficulty}
                                <button onClick={() => handleFilterChange('difficulty', '')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.level && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.level}
                                <button onClick={() => handleFilterChange('level', '')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.category && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.category}
                                <button onClick={() => handleFilterChange('category', '')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.prepTime && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.prepTime}
                                <button onClick={() => handleFilterChange('prepTime', '')} className="hover:text-error">×</button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && items.length > 0 && (
                    <div className="text-sm text-on-surface-variant mb-6">
                        Found <span className="font-black text-primary">{items.length}</span> recipe{items.length !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Content Section */}
                <div>
                        {loading ? (
                            <HorizontalRecipeListSkeleton count={4} />
                        ) : (
                            <div className='flex flex-col items-center gap-10 pb-32'>
                                {items.length > 0 ? (
                                    <>
                                        {items.slice(0, visibleCount).map((item) => (
                                            <div key={item.id || item._id} className="w-full max-w-4xl">
                                                <HorizontalCard item={item} />
                                            </div>
                                        ))}
                                        {visibleCount < items.length && (
                                            <div className="flex justify-center mt-8">
                                                <button 
                                                    onClick={() => setVisibleCount(v => v + 6)}
                                                    className="px-8 py-4 rounded-3xl bg-white/60 backdrop-blur-md border border-white/40 hover:border-primary/40 text-on-surface font-black transition-all shadow-sm hover:shadow-md uppercase text-[10px] tracking-widest"
                                                >
                                                    Reveal More
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-24 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 space-y-8 overflow-hidden"
                                    >
                                        <LottiePlayer 
                                           animationUrl="https://assets10.lottiefiles.com/packages/lf20_m6cuL6.json" 
                                           className="w-80 h-80 mx-auto"
                                        />
                                        <div className="space-y-3 relative z-10">
                                            <h3 className="text-4xl font-headline font-black text-on-surface tracking-tight">No Recipes Found.</h3>
                                            <p className="text-on-surface-variant font-medium opacity-60 max-w-md mx-auto">No recipes were found matching your filters.</p>
                                            {hasActiveFilters && (
                                                <button 
                                                    onClick={clearFilters}
                                                    className="text-primary font-black text-sm hover:underline"
                                                >
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Recipes;
