import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ShoppingContext = createContext();

export const ShoppingProvider = ({ children }) => {
    const [selectedRecipes, setSelectedRecipes] = useState([]);

    const toggleRecipeSelection = (recipeId) => {
        setSelectedRecipes(prev => {
            const isSelected = prev.includes(recipeId);
            if (isSelected) {
                toast.success('Removed from shopping plan');
                return prev.filter(id => id !== recipeId);
            } else {
                toast.success('Added to shopping plan');
                return [...prev, recipeId];
            }
        });
    };

    const clearSelection = () => setSelectedRecipes([]);

    return (
        <ShoppingContext.Provider value={{ selectedRecipes, toggleRecipeSelection, clearSelection }}>
            {children}
        </ShoppingContext.Provider>
    );
};

export const useShopping = () => useContext(ShoppingContext);
