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

    // Bump this version whenever backend data changes (e.g. re-seed, image URL fixes)
    // so stale cached image URLs are never served.
    const CACHE_VERSION = 'v3';

    const getCachedState = () => {
        try {
            const cached = sessionStorage.getItem('recipesDataCache');
            if (cached) {
                const parsed = JSON.parse(cached);

                // Invalidate cache if version doesn't match
                if (parsed.version !== CACHE_VERSION) {
                    sessionStorage.removeItem('recipesDataCache');
                    return null;
                }

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
    const initialTab = searchParams.get('tab') || 'all';
    const [activeTab, setActiveTab] = useState(initialTab); // 'all' or 'recommended'
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
    const [recommendations, setRecommendations] = useState([]);
    const [profile, setProfile] = useState(null);
    const [recLoading, setRecLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchPersonalData = async () => {
            const token = localStorage.getItem('token');
            setRecLoading(true);
            
            try {
                let userProfile = null;
                if (token) {
                    try {
                        const profileRes = await axios.get('http://localhost:8080/api/v1/health-profile', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        userProfile = profileRes?.data?.data;
                        setProfile(userProfile);
                    } catch (pErr) {
                        console.warn("Profile fetch failed, using defaults");
                    }
                }

                // Fetch recommendations
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const recRes = await axios.get('http://localhost:8080/api/v1/recipes/recommended?limit=6', { headers });
                
                let recData = recRes.data.data || [];
                
                // If personalized fetch returned nothing but we are logged in, 
                // we should still show SOMETHING (Popular)
                if (token && recData.length === 0) {
                     const fallbackRes = await axios.get('http://localhost:8080/api/v1/recipes/recommended?limit=6');
                     recData = fallbackRes.data.data || [];
                }

                if (!token) {
                    const teaserCard = { id: 'personalization-teaser', isTeaserCard: true };
                    recData = [teaserCard, ...recData];
                } else {
                    // Logged in
                    if (!userProfile || userProfile.completionPercentage < 100) {
                        const upgradeCard = { 
                            id: 'upgrade-personalization', 
                            isUpgradeCard: true, 
                            percentage: userProfile?.completionPercentage || 0 
                        };
                        recData = [upgradeCard, ...recData];
                    }
                }
                
                setRecommendations(recData);
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
                // Last ditch effort: Try to get popular recipes even on total failure
                try {
                    const fallbackRes = await axios.get('http://localhost:8080/api/v1/recipes/recommended?limit=6');
                    setRecommendations(fallbackRes.data.data || []);
                } catch (e) {}
            } finally {
                setRecLoading(false);
            }
        };
        fetchPersonalData();
    }, []);

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
    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
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
            const urlDiet = searchParams.get('dietType') || "";
            const urlDiff = searchParams.get('difficulty') || "";
            const urlMeal = searchParams.get('mealType') || "";
            const urlPrep = searchParams.get('prepTime') || "";

            const params = new URLSearchParams();
            params.append('size', '10');
            
            if (query) params.append('q', query);
            
            // Map frontend values to backend enum values
            const dietMap = { 'Vegetarian': 'VEG', 'Non-Vegetarian': 'NON_VEG', 'Vegan': 'VEGAN', 'No Preference': 'NO_PREFERENCE' };
            const diffMap = { 'Easy': 'EASY', 'Medium': 'MEDIUM', 'Hard': 'HARD' };
            const mealMap = { 'Breakfast': 'BREAKFAST', 'Lunch': 'LUNCH', 'Dinner': 'DINNER', 'Snack': 'SNACK' };

            if (urlDiet && dietMap[urlDiet]) params.append('dietType', dietMap[urlDiet]);
            if (urlDiff && diffMap[urlDiff]) params.append('difficulty', diffMap[urlDiff]);
            if (urlMeal && mealMap[urlMeal]) params.append('mealType', mealMap[urlMeal]);
            
            if (urlPrep) {
                if (urlPrep === 'Under 15 min') {
                    params.append('maxPrepTime', '15');
                } else if (urlPrep === '15-30 min') {
                    params.append('minPrepTime', '15');
                    params.append('maxPrepTime', '30');
                } else if (urlPrep === '30-60 min') {
                    params.append('minPrepTime', '30');
                    params.append('maxPrepTime', '60');
                } else if (urlPrep === 'Over 60 min') {
                    params.append('minPrepTime', '61');
                }
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
        
        // Sync filters state from searchParams whenever URL changes
        const urlDiet = searchParams.get('dietType') || '';
        const urlDiff = searchParams.get('difficulty') || '';
        const urlMeal = searchParams.get('mealType') || '';
        const urlPrep = searchParams.get('prepTime') || '';
        const urlQ = searchParams.get('q') || '';

        setFilters({
            dietType: urlDiet,
            difficulty: urlDiff,
            mealType: urlMeal,
            cuisineType: '',
            prepTime: urlPrep
        });
        setSearchQuery(urlQ);

        fetchRecipes();
    }, [searchParams]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading && items.length > 0) {
            sessionStorage.setItem('recipesDataCache', JSON.stringify({
                version: CACHE_VERSION,
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
                        Back
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

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 mb-10 bg-surface-container-low p-1.5 rounded-3xl w-fit border border-outline-variant/5">
                    <button 
                        onClick={() => {
                            setActiveTab('all');
                            setSearchParams(prev => {
                                prev.set('tab', 'all');
                                return prev;
                            });
                        }}
                        className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        All Recipes
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('recommended');
                            setSearchParams(prev => {
                                prev.set('tab', 'recommended');
                                return prev;
                            });
                        }}
                        className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'recommended' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        <span className="material-symbols-outlined text-sm">temp_preferences_custom</span>
                        For You
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'all' ? (
                        <motion.div 
                            key="all-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
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
                                    Total <span className="font-black text-primary">{resultCount}</span> recipes found
                                </div>
                            )}

                            {/* Main List */}
                            {loading && items.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                    <div className="text-primary font-bold tracking-widest text-sm uppercase">Loading Catalog...</div>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center gap-8 pb-32'>
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
                                                        {loadingMore ? 'Loading More...' : 'Explore Further'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-24 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-white/60 w-full">
                                            <h3 className="text-3xl font-headline font-black text-on-surface">No matches found</h3>
                                            <p className="opacity-60 mb-6">Try adjusting your filters or search terms.</p>
                                            <button onClick={clearFilters} className="text-primary font-black text-sm uppercase">Reset All</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="recommended-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="pb-32"
                        >
                            <div className="mb-10">
                                <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">Personalized Selections</h2>
                                <p className="text-on-surface-variant mt-2 font-medium opacity-60">Hand-picked compositions based on your metabolic signature and preferences.</p>
                            </div>

                            <div className="flex flex-col items-center gap-10">
                                {recommendations.map((rec) => (
                                    rec.isTeaserCard ? (
                                        <div key="teaser-card" className="w-full max-w-5xl">
                                            <motion.div 
                                                whileHover={{ y: -5 }}
                                                onClick={() => navigate('/login')}
                                                className="group cursor-pointer"
                                            >
                                                <div className="bg-on-surface rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 relative overflow-hidden">
                                                    <div className="absolute inset-0 vitality-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                                        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20">
                                                            <span className="material-symbols-outlined text-5xl">lock</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-3xl font-headline font-black text-white leading-tight">Unlock Your Metabolic Profile</h3>
                                                            <p className="text-white/60 font-medium">Join now to see recipes perfectly aligned with your dietary needs and health goals.</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <button className="relative z-10 px-10 py-5 bg-white text-on-surface font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all whitespace-nowrap">
                                                        Personalize Now
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </div>
                                    ) : rec.isUpgradeCard ? (
                                        <div key="upgrade-card" className="w-full max-w-5xl">
                                            <motion.div 
                                                whileHover={{ y: -5 }}
                                                onClick={() => navigate('/profile/complete')}
                                                className="group cursor-pointer"
                                            >
                                                <div className="bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/30 p-10 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-primary/10 transition-all duration-500">
                                                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left flex-1">
                                                        <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg">
                                                            <span className="material-symbols-outlined text-5xl">bolt</span>
                                                        </div>
                                                        <div className="space-y-4 flex-1">
                                                            <h3 className="text-3xl font-headline font-black text-on-surface leading-tight">Improve Your Match</h3>
                                                            <p className="text-on-surface-variant font-medium">Your profile is <span className="text-primary font-black">{rec.percentage}%</span> complete. Adding more data improves accuracy.</p>
                                                            <div className="w-full max-w-md h-3 bg-surface-container-high rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${rec.percentage}%` }}
                                                                    className="h-full vitality-gradient"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button className="px-10 py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-primary/20 transition-all whitespace-nowrap">
                                                        Complete Profile
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <div key={rec.id} className="w-full max-w-5xl">
                                            <HorizontalCard item={rec} isPersonalized={true} />
                                        </div>
                                    )
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Recipes;
