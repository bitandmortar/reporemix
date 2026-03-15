import React from 'react';
import { clsx } from 'clsx';

/**
 * Card Component
 * 
 * @param {Object} props
 * @param {'default' | 'elevated' | 'outlined'} [props.variant='default'] - Card variant
 * @param {boolean} [props.hoverable=false] - Enable hover effect
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 */
export function Card({
  variant = 'default',
  hoverable = false,
  children,
  className,
}) {
  const baseStyles = 'rounded-xl overflow-hidden transition-all';
  
  const variantStyles = {
    default: 'bg-[#1a1f2e] border border-[#2a2f3e]',
    elevated: 'bg-[#1a1f2e] shadow-lg shadow-black/20',
    outlined: 'bg-transparent border-2 border-[#2a2f3e]',
  };
  
  const hoverStyles = hoverable ? 'hover:shadow-xl hover:shadow-black/30 hover:border-[#ffd166]/50 cursor-pointer' : '';
  
  return (
    <div className={clsx(baseStyles, variantStyles[variant], hoverStyles, className)}>
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
export function CardHeader({ children, className }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-[#2a2f3e]', className)}>
      {children}
    </div>
  );
}

/**
 * Card Body Component
 */
export function CardBody({ children, className }) {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
}

/**
 * Card Footer Component
 */
export function CardFooter({ children, className }) {
  return (
    <div className={clsx('px-6 py-4 border-t border-[#2a2f3e] bg-[#0f121a]', className)}>
      {children}
    </div>
  );
}

export default Card;
