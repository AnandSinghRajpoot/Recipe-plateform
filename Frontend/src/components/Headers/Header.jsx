import React, { useState } from 'react';
import DesktopNav from './DesktopNav';
import logo from  "../../assets/logo.svg";
import MobileNav from './MobileNav';
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";

const Header = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [hideLeft, setHideLeft] = useState("-left-[1000px]");
    const navigate = useNavigate();

    const menuItems = ["recipe","resource","about","contact"]
    const onOpen = () => {
        setHideLeft ("left-0");
    }
    const onClose = () => {
        setHideLeft ("-left-[1000px]");
    }

  return (
    <>
    {/* Scroll Progress Bar */}
    <motion.div
        className="fixed top-0 left-0 right-0 h-1 vitality-gradient z-[10001] origin-left"
        style={{ scaleX }}
    />

    <div className="max-[900px]:hidden">
      <DesktopNav menuItems={menuItems} Logo={logo}/>
    </div>
    <div className='min-[900px]:hidden'>
      <MobileNav menuItems={menuItems} Logo={logo} onClose={onClose} hideLeft={hideLeft} onOpen={onOpen}/>
    </div>
    </>
  )
}

export default Header;
