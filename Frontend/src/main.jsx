import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Home from './pages/Homes/Home.jsx';
import ErrorPage from './components/Headers/ErrorPage.jsx'
import CategoriesPage from './pages/Category/CategoriesPage.jsx';
import Search from './pages/Search.jsx';
import SingleProduct from './pages/product/SingleProduct.jsx';
import Recipes from './pages/product/Recipes.jsx';
import Resources from './pages/product/Resources.jsx';
import About from './pages/product/About.jsx'
import Contact from './pages/product/Contact.jsx';
import LoginPage from './pages/Homes/LoginPage.jsx'
import Signup from './pages/Homes/Signup.jsx'
import ForgotPassword from './pages/Homes/ForgotPassword.jsx'
import ResetPasswordSent from './pages/Homes/ResetPasswordSent.jsx'
import ResetPassword from './pages/Homes/ResetPassword.jsx'
import PasswordResetSuccess from './pages/Homes/PasswordResetSuccess.jsx'
import Settings from './pages/Homes/Settings.jsx'
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe.jsx";
import ProfileComplete from "./pages/ProfileComplete.jsx";
import Profile from './pages/Homes/profile.jsx';
import ChefDashboard from './pages/ChefDashboard.jsx';
import MealPlanner from './pages/product/MealPlanner.jsx';
import ChefProfile from './pages/ChefProfile.jsx';


const router = createBrowserRouter([
  {
    path : "/",
    element : <App />,
    errorElement :<ErrorPage />,
    children : [
      {
        path : "/",
        element : <Home/>
      },
      {
        path : "/categories/:category",
        element : <CategoriesPage/>,
      },
      {
        path : "/search",
        element : <Search />,
      },
        {
          path: "/items/:id",
          element : <SingleProduct/>,
          loader : ({params}) => fetch(`http://localhost:8080/api/v1/recipes/${params.id}`)
        },
        
        {
          path : "/recipes",
          element : <Recipes/>
        },
        {
          path : "/meal-planner",
          element : <MealPlanner/>
        },
        {
          path : "/addRecipe",
          element : <AddRecipe/>
        
        },
        {
          path : "/edit-recipe/:id",
          element : <EditRecipe/>
        },
        {
          path : "/resources",
          element : <Resources/>
        },
        {
          path : "/about",
          element : <About/>
        },
        {
          path : "/contact",
          element : <Contact/>
        },
        {
          path : "/login",
          element : <LoginPage/>
        },
        {
          path : "/signup",
          element : <Signup/>
        },
        {
          path : "/forgot-password",
          element : <ForgotPassword/>
        },
        {
          path : "/reset-password-sent",
          element : <ResetPasswordSent/>
        },
        {
          path : "/reset-password",
          element : <ResetPassword/>
        },
        {
          path : "/password-reset-success",
          element : <PasswordResetSuccess/>
        },
        {
          path : "/settings",
          element : <Settings/>
        },
        {
          path : "/profile/complete",
          element : <ProfileComplete/>
        },
        {
          path : "/profile",
          element : <Profile/>
        },



        {
          path: "/chef-dashboard",
          element: <ChefDashboard />
        },
        {
          path: "/chef/:id",
          element: <ChefProfile />
        },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)

