import React, { useState, useEffect, useRef } from 'react';
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
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);
    const navigate = useNavigate();

    const menuItems = ["recipe","resource","about","contact"]
    const onOpen = () => {
        setHideLeft ("left-0");
    }
    const onClose = () => {
        setHideLeft ("-left-[1000px]");
    }

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
            
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <>
    {/* Scroll Progress Bar */}
    <motion.div
        className="fixed top-0 left-0 right-0 h-1 vitality-gradient z-[10001] origin-left"
        style={{ scaleX }}
    />

    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="max-[900px]:hidden">
        <DesktopNav menuItems={menuItems} Logo={logo}/>
        </div>
        <div className='min-[900px]:hidden'>
        <MobileNav menuItems={menuItems} Logo={logo} onClose={onClose} hideLeft={hideLeft} onOpen={onOpen}/>
        </div>
    </div>
    </>
  )
}

export default Header;
