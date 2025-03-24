
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedFeatureIconProps {
  icon: React.ReactNode;
  className?: string;
}

export function AnimatedFeatureIcon({ icon, className = '' }: AnimatedFeatureIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconControls = useAnimation();
  
  useEffect(() => {
    if (isHovered) {
      iconControls.start({
        scale: [1, 1.2, 0.8],
        opacity: [1, 0.7, 0],
        x: [0, 10, -50],
        transition: { duration: 1.5, ease: "easeInOut" }
      });
    } else {
      iconControls.start({
        scale: 1,
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 }
      });
    }
  }, [isHovered, iconControls]);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={iconControls}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {icon}
      </motion.div>
      <div className="opacity-0">
        {icon}
      </div>
    </div>
  );
}
