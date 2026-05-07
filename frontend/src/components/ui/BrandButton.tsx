import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface BrandButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'solid' | 'glass' | 'ghost';
  children: React.ReactNode;
  className?: string;
}

/**
 * A standard button component following the "Pill" shape and monochrome variants.
 * Follows the "Digital Monolith" design system spec.
 */
export const BrandButton: React.FC<BrandButtonProps> = ({
  variant = 'solid',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-pill font-display font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2';
  
  const variants = {
    solid: 'px-8 py-3 bg-primary text-on-primary hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]',
    glass: 'px-8 py-3 glass glass-hover text-primary hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'px-8 py-3 bg-transparent text-primary hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98]'
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
