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
 * TiltCard
 * A premium 3D perspective tilt effect utilizing CSS rotateX/Y tracking 
 * the relative cursor coordinates over the component geometry.
 */
export const TiltCard = ({ children, className, style }) => {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0.5); // 0 to 1 mapping
  const y = useMotionValue(0.5); // 0 to 1 mapping

  const springX = useSpring(x, { stiffness: 300, damping: 30, bounce: 0 });
  const springY = useSpring(y, { stiffness: 300, damping: 30, bounce: 0 });

  const rotateX = useTransform(springY, [0, 1], [10, -10]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);
  
  // Calculate dynamic mouse-tracking gradient lighting
  const bgX = useTransform(springX, [0, 1], [0, 100]);
  const bgY = useTransform(springY, [0, 1], [0, 100]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const relativeX = e.clientX - left;
    const relativeY = e.clientY - top;
    
    x.set(relativeX / width);
    y.set(relativeY / height);
  };

  const handleMouseEnter = () => setHovering(true);
  
  const handleMouseLeave = () => {
    setHovering(false);
    x.set(0.5);
    y.set(0.5);
  };

  // Inject CSS variable natively for a dynamic glowing spotlight effect over the card.
  useEffect(() => {
    if (ref.current) {
      bgX.onChange((v) => ref.current.style.setProperty('--mouseX', `${v}%`));
      bgY.onChange((v) => ref.current.style.setProperty('--mouseY', `${v}%`));
    }
  }, [bgX, bgY]);

  return (
    <motion.div
      ref={ref}
      className={`tilt-card-container ${className || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        ...style
      }}
      initial={{ scale: 1, z: 0 }}
      animate={{ 
        scale: hovering ? 1.03 : 1,
        z: hovering ? 20 : 0
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%"
        }}
      >
        <div className="tilt-card-content">
          {children}
        </div>
        
        {/* Soft cursor-following light wash */}
        <motion.div
          className="tilt-card-glare"
          animate={{ opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
            background: "radial-gradient(circle at var(--mouseX, 50%) var(--mouseY, 50%), rgba(255,255,255,0.06) 0%, transparent 60%)"
          }}
        />
      </motion.div>
    </motion.div>
  );
};
