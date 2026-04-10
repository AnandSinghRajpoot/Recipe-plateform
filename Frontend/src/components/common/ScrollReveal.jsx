import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, delay = 0, x = 0, y = 30, duration = 0.8 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
