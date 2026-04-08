import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = ({ enabled = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const trailRef = useRef([]);
  const maxTrailLength = 10;

  useEffect(() => {
    if (!enabled) return;

    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      trailRef.current = [...trailRef.current, { x: e.clientX, y: e.clientY, time: Date.now() }];
      if (trailRef.current.length > maxTrailLength) {
        trailRef.current = trailRef.current.slice(-maxTrailLength);
      }
      setTrail([...trailRef.current]);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || 
          target.closest('a') || target.closest('button') ||
          target.classList.contains('cursor-pointer') ||
          target.getAttribute('role') === 'button';
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Trail effects */}
      {trail.map((point, index) => {
        const age = Date.now() - point.time;
        const opacity = Math.max(0, 1 - age / 150);
        const scale = Math.max(0.2, 0.8 - index * 0.06);
        
        if (opacity < 0.15) return null;
        
        return (
          <div
            key={index}
            className="fixed pointer-events-none rounded-full"
            style={{
              left: point.x,
              top: point.y,
              width: 12 * scale,
              height: 12 * scale,
              backgroundColor: `rgba(34, 197, 94, ${opacity * 0.4})`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {/* Main cursor with glow */}
      <div
        className="fixed pointer-events-none transition-transform duration-75"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.8 : 1})`,
        }}
      >
        {/* Glow */}
        <div 
          className="absolute rounded-full"
          style={{
            width: isHovering ? 48 : 28,
            height: isHovering ? 48 : 28,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(10px)',
          }}
        />
        
        {/* Core */}
        <div 
          className="absolute rounded-full"
          style={{
            width: isHovering ? 12 : 8,
            height: isHovering ? 12 : 8,
            backgroundColor: '#22c55e',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
          }}
        />
      </div>
    </>
  );
};

export default CustomCursor;