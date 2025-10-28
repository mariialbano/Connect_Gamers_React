import React from 'react';

const Card = ({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-soft',
    elevated: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-medium',
    flat: 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700',
    glass: 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50',
    gradient: 'bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 border border-pink-200 dark:border-pink-700',
  };
  
  const hoverClasses = hover ? 'hover:shadow-medium hover:scale-[1.02] cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `${baseClasses} ${variants[variant]} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;