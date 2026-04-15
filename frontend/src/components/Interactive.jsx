// components/Interactive.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * MagneticWrapper
 * Adds a physical "pull" effect towards the user's cursor when hovered.
 * Ideal for critical CTA buttons.
 */
export const MagneticWrapper = ({ children, strength = 20, style, className }) => {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate distance from center
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Move element slightly toward cursor
    x.set((distanceX / width) * strength);
    y.set((distanceY / height) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, ...style }}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
    >
      {children}
    </motion.div>
  );
};


/**
 * 1. EventCard3D 
 * Lift upward, tilt slightly, glow border
 */
export const EventCard3D = ({ children, className, style }) => {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);
  
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springX = useSpring(x, { stiffness: 300, damping: 25, bounce: 0 });
  const springY = useSpring(y, { stiffness: 300, damping: 25, bounce: 0 });

  const rotateX = useTransform(springY, [0, 1], [12, -12]);
  const rotateY = useTransform(springX, [0, 1], [-12, 12]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - left) / width);
    y.set((e.clientY - top) / height);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className || ""}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); x.set(0.5); y.set(0.5); }}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000, ...style }}
      initial={{ scale: 1, y: 0 }}
      animate={{ scale: hovering ? 1.02 : 1, y: hovering ? -12 : 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d", width: "100%", height: "100%" }}>
        <motion.div 
          style={{ width: "100%", height: "100%" }}
          animate={{ boxShadow: hovering ? "0 0 0 2px var(--gold-light), 0 20px 40px rgba(201,168,76,0.2)" : "0 8px 16px rgba(0,0,0,0.1)" }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/**
 * 2. FeatureCard3D
 * Rotate slightly, scale up significantly, add massive diffuse shadow
 */
export const FeatureCard3D = ({ children, className, style }) => {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);
  
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springX = useSpring(x, { stiffness: 400, damping: 30 });
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);
  const rotateZ = useTransform(springX, [0, 1], [-2, 2]); // Rotate slightly

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - left) / width);
    y.set((e.clientY - top) / height);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); x.set(0.5); y.set(0.5); }}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1200, ...style }}
      initial={{ scale: 1, z: 0 }}
      animate={{ scale: hovering ? 1.06 : 1, z: hovering ? 40 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div 
        style={{ rotateX, rotateY, rotateZ, transformStyle: "preserve-3d", width: "100%", height: "100%" }}
        animate={{ boxShadow: hovering ? "0 30px 60px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * 3. CategoryCard3D
 * Slide upward securely, add internal radial background glow
 */
export const CategoryCard3D = ({ children, className, style, glowColor = "rgba(201,168,76,0.15)" }) => {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);
  
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const bgX = useTransform(x, [0, 1], [0, 100]);
  const bgY = useTransform(y, [0, 1], [0, 100]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - left) / width);
    y.set((e.clientY - top) / height);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className || ""}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); x.set(0.5); y.set(0.5); }}
      onMouseMove={handleMouseMove}
      style={{ ...style }}
      initial={{ y: 0 }}
      animate={{ y: hovering ? -18 : 0 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
    >
      {/* Background radial glow tied to cursor */}
      <motion.div
        animate={{ opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(circle 120px at var(--glowX, 50%) var(--glowY, 50%), ${glowColor}, transparent)`
        }}
      />
      {/* Invisible tracker */}
      <motion.div 
        style={{ position: 'absolute', inset: 0, opacity: 0 }}
        onUpdate={() => {
          if (ref.current) {
            ref.current.style.setProperty('--glowX', `${bgX.get()}%`);
            ref.current.style.setProperty('--glowY', `${bgY.get()}%`);
          }
        }} 
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
};

/**
 * 4. DashboardCard3D
 * Flip completely on hover using pronounced rotateY, deeply pushes perspective.
 */
export const DashboardCard3D = ({ children, className, style }) => {
  const [hovering, setHovering] = useState(false);
  return (
    <motion.div
      className={className}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ perspective: 1000, ...style }}
      initial={{ scale: 1 }}
      animate={{ scale: hovering ? 1.03 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
        animate={{ rotateY: hovering ? 8 : 0, z: hovering ? 30 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * 5. TicketCard3D
 * Bounce slightly, add soft pulse glow around the outline
 */
export const TicketCard3D = ({ children, className, style, onClick }) => {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      style={{ ...style }}
      whileHover={{ 
        y: -6, 
        scale: 1.02, 
        boxShadow: "0 0 15px rgba(201,168,76,0.4)" 
      }}
      transition={{ 
        type: "spring", stiffness: 400, damping: 10, mass: 0.8 
      }}
    >
      {children}
    </motion.div>
  );
};


/**
 * DirectionalReveal
 * Handles staggered scroll appearances based on direction
 * direction: 'left' | 'right' | 'top' | 'bottom' | 'zoom'
 */
export const DirectionalReveal = ({ children, direction = 'bottom', delay = 0, className, style }) => {
  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -60 : direction === 'right' ? 60 : 0,
      y: direction === 'top' ? -60 : direction === 'bottom' ? 60 : 0,
      scale: direction === 'zoom' ? 0.8 : 1
    },
    visible: { 
      opacity: 1, x: 0, y: 0, scale: 1,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * PageTransition
 * Wraps Routes to provide smooth entering and exiting fade transitions
 */
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-transition-wrapper w-full h-full"
    >
      {children}
    </motion.div>
  );
};
