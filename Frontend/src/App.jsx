import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Header from "./components/Headers/Header.jsx";
import Footer from './components/Headers/Footer.jsx';   
import Profile from './pages/Homes/profile.jsx';



import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { motion, AnimatePresence } from "framer-motion";

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
    <ErrorBoundary>
      <Toaster position="top-right" reverseOrder={false} />
      <div className='max-w-screen-2xl mx-auto'>
        {!hideHeaderFooter && <Header/>}
        
        <div className={!hideHeaderFooter ? 'min-h-[calc(100vh-136px)]' : 'min-h-screen'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      
        {!hideHeaderFooter && <Footer/>}
      </div>
    </ErrorBoundary>
  )
}

export default App
