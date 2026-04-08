import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Header from "./components/Headers/Header.jsx";
import Footer from './components/Headers/Footer.jsx';   
import Profile from './pages/Homes/profile.jsx';



function App() {
  const location = useLocation();
  const hideHeaderFooter = [
    "/login", 
    "/signup", 
    "/forgot-password",
    "/reset-password-sent",
    "/reset-password",
    "/password-reset-success",
    "/profile", 
    "/profile/complete", 
    "/settings",
    "/addRecipe", 
    "/my-recipes",
    "/checkout",
    "/chef-dashboard"
  ].some(path => location.pathname === path || location.pathname.startsWith("/edit-recipe/"));

  return (
    <div className='max-w-screen-2xl mx-auto'>
      {!hideHeaderFooter && <Header/>}
      
      <div className={!hideHeaderFooter ? 'min-h-[calc(100vh-136px)]' : 'min-h-screen'}>
        <Outlet key={location.pathname} className="page-enter"/>
      </div>
     
     <Footer/>
    </div>
  )
}

export default App
