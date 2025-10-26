import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500 shadow-soft hover:shadow-medium',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-soft hover:shadow-medium',
    accent: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 shadow-soft hover:shadow-medium',
    outline: 'border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white focus:ring-pink-500',
    ghost: 'text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 focus:ring-pink-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-soft hover:shadow-medium',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-soft hover:shadow-medium',
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };
  
  const iconClass = iconSizes[size];
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const iconElement = icon && (
    <span className={`${iconClass} ${iconPosition === 'right' ? 'ml-2' : 'mr-2'}`}>
      {icon}
    </span>
  );
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg className={`${iconClass} mr-2 animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando...
        </>
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          {children}
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </button>
  );
};

export default Button;