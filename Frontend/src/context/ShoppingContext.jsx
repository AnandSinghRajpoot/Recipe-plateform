import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ShoppingContext = createContext();

export const ShoppingProvider = ({ children }) => {
    const [selectedRecipes, setSelectedRecipes] = useState(() => {
        const saved = localStorage.getItem('shopping_bag');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('shopping_bag', JSON.stringify(selectedRecipes));
    }, [selectedRecipes]);

    const toggleRecipeSelection = (recipeId) => {
        const id = typeof recipeId === 'string' ? parseInt(recipeId) : recipeId;
        setSelectedRecipes(prev => {
            const isSelected = prev.includes(id);
            if (isSelected) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });

        // Use a small delay or just do it after state update to avoid rendering-phase updates
        const wasSelected = selectedRecipes.includes(id);
        if (wasSelected) {
            toast.success('Removed from shopping plan');
        } else {
            toast.success('Added to shopping plan');
        }
    };

    const clearSelection = () => {
        setSelectedRecipes([]);
        localStorage.removeItem('shopping_bag');
    };

    return (
        <ShoppingContext.Provider value={{ selectedRecipes, toggleRecipeSelection, clearSelection }}>
            {children}
        </ShoppingContext.Provider>
    );
};

export const useShopping = () => useContext(ShoppingContext);
