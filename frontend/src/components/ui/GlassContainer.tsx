import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

/**
 * A reusable glassmorphic container with configurable blur and opacity.
 * Follows the "Digital Monolith" design system spec.
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <motion.div
      className={`glass ${hoverEffect ? 'glass-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
