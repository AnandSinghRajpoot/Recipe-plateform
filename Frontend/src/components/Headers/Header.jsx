import React,{useState} from 'react'
import DesktopNav from './DesktopNav';
import logo from  "../../assets/logo.svg";
import MobileNav from './MobileNav';
import { useNavigate } from "react-router-dom";
const Header = () => {
    const [hideLeft, setHideLeft] = useState("-left-[1000px]");
    const navigate = useNavigate();

    const menuItems = ["recipes","resources","addRecipe","about","contact"]
    const onOpen = () => {
        setHideLeft ("left-0");
    }
    const onClose = () => {
        setHideLeft ("-left-[1000px]");
    }

  return (
    <>
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
