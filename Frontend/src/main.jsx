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
import AddRecipe from "./pages/AddRecipe";


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
          loader : ({params}) => fetch(`http://localhost:5000/api/items/${params.id}`)
        },
        
        {
          path : "/recipes",
          element : <Recipes/>
        },
        {
          path : "/addRecipe",
          element : <AddRecipe/>
        
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
        }



    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)

