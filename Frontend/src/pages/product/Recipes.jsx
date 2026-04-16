import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import HorizontalCard from "../../components/Headers/HorizontalCard.jsx";
import LottiePlayer from '../../components/common/LottiePlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearchOutline } from 'react-icons/io5';

const Recipes = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isReturning = !!sessionStorage.getItem('recipesScrollPos');

    const getCachedState = () => {
        try {
            const cached = sessionStorage.getItem('recipesDataCache');
            if (cached) {
                const parsed = JSON.parse(cached);
                
                const norm = (s) => decodeURIComponent(s || '').replace(/\+/g, ' ').trim();
                
                if (isReturning || norm(parsed.searchQuery) === norm(location.search)) {
                    return parsed;
                }
            }
        } catch (e) {}
        return null;
    };

    const cachedState = getCachedState();

    const [items, setItems] = useState(cachedState ? cachedState.items : []);
    const [loading, setLoading] = useState(!cachedState);
    const [initialLoadDone, setInitialLoadDone] = useState(!!cachedState);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(cachedState ? cachedState.hasMore : true);
    const [cursor, setCursor] = useState(cachedState ? cachedState.cursor : null);
    const [allLoaded, setAllLoaded] = useState(cachedState ? cachedState.allLoaded : false);
    const [resultCount, setResultCount] = useState(cachedState ? cachedState.resultCount : null);
    const [preventInitialFetch, setPreventInitialFetch] = useState(!!cachedState);
    const [filters, setFilters] = useState(cachedState && cachedState.filters ? cachedState.filters : {
        dietType: searchParams.get('dietType') || '',
        difficulty: searchParams.get('difficulty') || '',
        mealType: searchParams.get('mealType') || '',
        cuisineType: searchParams.get('cuisineType') || '',
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
        if (filters.dietType) newParams.set('dietType', filters.dietType);
        if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
        if (filters.mealType) newParams.set('mealType', filters.mealType);
        if (filters.prepTime) newParams.set('prepTime', filters.prepTime);
        setSearchParams(newParams);
        setShowDropdown(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    const dietTypes = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Brunch'];
    const prepTimes = ['Under 15 min', '15-30 min', '30-60 min', 'Over 60 min'];

    const fetchRecipes = useCallback(async (loadMore = false) => {
        try {
            if (loadMore) {
                setLoadingMore(true);
            } else {
                // Only show loading on initial load or when search params change
                if (!initialLoadDone) {
                    setLoading(true);
                }
                setCursor(null);
                setAllLoaded(false);
            }
            
            const query = searchParams.get('q') || "";
            const params = new URLSearchParams();
            params.append('size', '10');
            
            if (query) params.append('q', query);
            
            // Map frontend values to backend enum values
            const dietMap = { 'Vegetarian': 'VEG', 'Non-Vegetarian': 'NON_VEG', 'Vegan': 'VEGAN', 'No Preference': 'NO_PREFERENCE' };
            const diffMap = { 'Easy': 'EASY', 'Medium': 'MEDIUM', 'Hard': 'HARD' };
            const mealMap = { 'Breakfast': 'BREAKFAST', 'Lunch': 'LUNCH', 'Dinner': 'DINNER', 'Dessert': 'DESSERT', 'Snack': 'SNACK', 'Beverage': 'BEVERAGE', 'Brunch': 'BRUNCH' };

            if (filters.dietType && dietMap[filters.dietType]) params.append('dietType', dietMap[filters.dietType]);
            if (filters.difficulty && diffMap[filters.difficulty]) params.append('difficulty', diffMap[filters.difficulty]);
            if (filters.mealType && mealMap[filters.mealType]) params.append('mealType', mealMap[filters.mealType]);
            if (filters.prepTime) {
                // Map prep time to actual prep time filtering
                if (filters.prepTime === 'Under 15 min') {
                    params.append('maxPrepTime', '15');
                } else if (filters.prepTime === '15-30 min') {
                    params.append('maxPrepTime', '30');
                } else if (filters.prepTime === '30-60 min') {
                    params.append('maxPrepTime', '60');
                }
                // "Over 60 min" doesn't need a parameter as it includes everything > 60
            }

            const currentCursor = loadMore ? cursor : null;
            if (currentCursor) params.append('cursor', currentCursor.toString());

            const response = await axios.get(`http://localhost:8080/api/v1/recipes?${params.toString()}`, {
                timeout: 8000
            });
            const data = response.data.data || [];
            const message = response.data?.message;
            
            const newItems = loadMore ? [...items, ...data] : data;
            setItems(newItems);
            
            if (message && message.includes('Found')) {
                const match = message.match(/Found (\d+) recipes/);
                if (match) setResultCount(parseInt(match[1]));
            } else {
                setResultCount(null);
            }
            
            if (data.length < 10) {
                setHasMore(false);
                setAllLoaded(true);
            } else {
                setHasMore(true);
                setCursor(data[data.length - 1]?.id);
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            if (!loadMore) setItems([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            if (!loadMore) {
                setInitialLoadDone(true);
            }
        }
    }, [searchParams, filters, cursor, items]);

    useEffect(() => {
        if (preventInitialFetch) {
            setPreventInitialFetch(false);
            return;
        }
        fetchRecipes();
    }, [searchParams]);

    useEffect(() => {
        if (!loading && items.length > 0) {
            sessionStorage.setItem('recipesDataCache', JSON.stringify({
                searchQuery: location.search,
                items,
                cursor,
                hasMore,
                allLoaded,
                resultCount,
                filters
            }));
        }
    }, [items, loading, cursor, hasMore, allLoaded, resultCount, location.search, filters]);

    // Restore scroll position and silent URL sync after recipes are loaded
    useEffect(() => {
        if (!loading && items.length > 0) {
            const savedPos = sessionStorage.getItem('recipesScrollPos');
            if (savedPos) {
                const pos = parseInt(savedPos);
                setTimeout(() => window.scrollTo(0, pos), 100);
                // Small delay to ensure all reads of isReturning have completed
                setTimeout(() => sessionStorage.removeItem('recipesScrollPos'), 200);
                
                // Silently correct the address bar if React Router lost the query params on POP
                if (cachedState && cachedState.searchQuery && cachedState.searchQuery !== location.search) {
                    window.history.replaceState(null, '', window.location.pathname + cachedState.searchQuery);
                }
            }
        }
    }, [loading, items]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        saveRecentSearch(searchQuery);
        const newParams = new URLSearchParams();
        if (searchQuery) newParams.set('q', searchQuery);
        if (filters.dietType) newParams.set('dietType', filters.dietType);
        if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
        if (filters.mealType) newParams.set('mealType', filters.mealType);
        if (filters.prepTime) newParams.set('prepTime', filters.prepTime);
        setSearchParams(newParams);
        setShowDropdown(false);
    };

    const handleFilterChange = (filterName, value) => {
        const paramMap = {
            diet: 'dietType',
            difficulty: 'difficulty',
            category: 'mealType',
            prepTime: 'prepTime'
        };
        const targetKey = paramMap[filterName] || filterName;
        setFilters(prev => ({ ...prev, [targetKey]: value }));
    };

    const clearFilters = () => {
        setFilters({
            dietType: '',
            difficulty: '',
            mealType: '',
            cuisineType: '',
            prepTime: ''
        });
        setSearchQuery('');
        setSearchParams(new URLSearchParams());
    };

    const removeFilterAndSearch = (targetKey) => {
        const newFilters = { ...filters, [targetKey]: '' };
        setFilters(newFilters);
        
        const newParams = new URLSearchParams();
        if (searchQuery) newParams.set('q', searchQuery);
        if (newFilters.dietType) newParams.set('dietType', newFilters.dietType);
        if (newFilters.difficulty) newParams.set('difficulty', newFilters.difficulty);
        if (newFilters.mealType) newParams.set('mealType', newFilters.mealType);
        if (newFilters.prepTime) newParams.set('prepTime', newFilters.prepTime);
        setSearchParams(newParams);
    };

    const removeSearchQueryAndSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        const newParams = new URLSearchParams();
        if (filters.dietType) newParams.set('dietType', filters.dietType);
        if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
        if (filters.mealType) newParams.set('mealType', filters.mealType);
        if (filters.prepTime) newParams.set('prepTime', filters.prepTime);
        setSearchParams(newParams);
    };

    const hasActiveFilters = filters.dietType || filters.difficulty || filters.mealType || filters.prepTime || searchQuery;
    
    return (
        <div className='bg-surface min-h-screen px-4 lg:px-12 py-24 font-body relative overflow-hidden'>
            
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-tertiary-container/10 blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Header & Back Navigation */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 text-[10px] font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Home
                    </button>
                    
                    <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface tracking-tighter">
                        Recipes
                    </h1>
                    <p className="text-on-surface-variant mt-2 font-medium opacity-80">Explore the complete collection of metabolic culinary compositions.</p>
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
                                            if (filters.dietType) newParams.set('dietType', filters.dietType);
                                            if (filters.difficulty) newParams.set('difficulty', filters.difficulty);
                                            if (filters.mealType) newParams.set('mealType', filters.mealType);
                                            if (filters.prepTime) newParams.set('prepTime', filters.prepTime);
                                            setSearchParams(newParams);
                                        }
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="flex-1 px-3 py-4 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                                />
                                {searchQuery && (
                                    <button 
                                        type="button"
                                        onClick={removeSearchQueryAndSearch}
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
                                                    onClick={() => handleFilterChange('diet', filters.dietType === type ? '' : type)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.dietType === type ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
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

                                    {/* Category */}
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-3">Meal Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleFilterChange('category', filters.mealType === cat ? '' : cat)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.mealType === cat ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}
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
                                <button onClick={removeSearchQueryAndSearch} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.dietType && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.dietType}
                                <button onClick={() => removeFilterAndSearch('dietType')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.difficulty && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.difficulty}
                                <button onClick={() => removeFilterAndSearch('difficulty')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.mealType && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.mealType}
                                <button onClick={() => removeFilterAndSearch('mealType')} className="hover:text-error">×</button>
                            </span>
                        )}
                        {filters.prepTime && (
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                                {filters.prepTime}
                                <button onClick={() => removeFilterAndSearch('prepTime')} className="hover:text-error">×</button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && items.length > 0 && resultCount !== null && (
                    <div className="text-sm text-on-surface-variant mb-6">
                        Found <span className="font-black text-primary">{resultCount}</span> recipe{resultCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Content Section */}
                <div>
                        {loading && items.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                <div className="text-primary font-bold tracking-widest text-sm uppercase">Loading Recipes...</div>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center gap-10 pb-32'>
                                {items.length > 0 ? (
                                    <>
                                        {items.map((item) => (
                                            <div key={item.id || item._id} className="w-full max-w-5xl">
                                                <HorizontalCard item={item} />
                                            </div>
                                        ))}
                                        {hasMore && !allLoaded && (
                                            <div className="flex justify-center mt-8">
                                                <button 
                                                    onClick={() => fetchRecipes(true)}
                                                    disabled={loadingMore}
                                                    className="px-8 py-4 rounded-3xl bg-white/60 backdrop-blur-md border border-white/40 hover:border-primary/40 text-on-surface font-black transition-all shadow-sm hover:shadow-md uppercase text-[10px] tracking-widest disabled:opacity-50"
                                                >
                                                    {loadingMore ? 'Loading...' : 'Load More'}
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
