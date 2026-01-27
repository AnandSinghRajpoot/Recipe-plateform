import React,{useState, useEffect} from 'react'
import DesktopNav from './DesktopNav';
import logo from  "../../assets/logo.svg";
import MobileNav from './MobileNav';
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';


const Header = () => {
    const [hideLeft, setHideLeft] = useState("-left-[1000px]");
    const [showBanner, setShowBanner] = useState(localStorage.getItem("showReminder") === "true");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setShowBanner(localStorage.getItem("showReminder") === "true");
    }, [location]);

    const menuItems = ["recipes","resources","addRecipe","about","contact"]
    const onOpen = () => {
        setHideLeft ("left-0");
    }
    const onClose = () => {
        setHideLeft ("-left-[1000px]");
    }

    const handleDismiss = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await axios.post("http://localhost:8080/api/v1/auth/reminder-dismiss", {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.setItem("showReminder", "false");
                setShowBanner(false);
            } catch (err) {
                console.error("Failed to dismiss reminder", err);
            }
        }
    };

  return (
    <>
    {showBanner && (
        <div className="bg-orange-100 border-b border-orange-200 py-2 px-4 flex items-center justify-between text-sm sm:text-base">
            <div className="flex items-center gap-2">
                <span className="text-orange-600 font-semibold">Step up your game!</span>
                <span className="text-gray-700 hidden sm:inline">Complete your profile to get personalized recipe recommendations.</span>
                <span className="text-gray-700 sm:hidden">Complete your profile!</span>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate("/profile/complete")}
                    className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition text-xs sm:text-sm font-medium"
                >
                    Complete Profile
                </button>
                <button 
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600 transition"
                    title="Dismiss"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    )}
    <div className="max-[900px]:hidden">
      <DesktopNav menuItems={menuItems} Logo={logo}/>
    </div>
    <div className='min-[900px]:hidden'>
      <MobileNav menuItems={menuItems} Logo={logo} onClose={onClose} hideLeft={hideLeft} onOpen={onOpen}/>
    </div>

    
    </>
  )
}

export default Header
