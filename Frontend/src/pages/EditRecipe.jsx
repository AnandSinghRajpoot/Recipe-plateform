import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateRecipeForm from './CreateRecipeForm';

const EditRecipe = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="bg-surface min-h-screen py-12 px-6">
            <CreateRecipeForm 
                recipeId={id} 
                onSuccess={() => navigate('/chef-dashboard')} 
                onCancel={() => navigate(-1)} 
            />
        </div>
    );
};

export default EditRecipe;
