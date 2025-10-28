import React from 'react';

const LayoutWrapper = ({ 
  children, 
  variant = 'default',
  className = '',
  showDecorations = true,
  ...props 
}) => {
  const variants = {
    default: 'bg-gradient-to-br from-pink-900 via-pink-800 to-blue-900',
    login: 'bg-gradient-to-br from-purple-900 via-pink-800 to-blue-900',
    games: 'bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900',
    profile: 'bg-gradient-to-br from-emerald-900 via-blue-800 to-purple-900',
    community: 'bg-gradient-to-br from-orange-900 via-red-800 to-pink-900',
    points: 'bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900',
    faq: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900',
    friends: 'bg-gradient-to-br from-teal-900 via-blue-800 to-purple-900',
  };

  const gradientClass = variants[variant] || variants.default;

  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`} {...props}>
      {/* Background com gradiente */}
      <div className={`absolute inset-0 ${gradientClass}`} />
      
      {/* Elementos decorativos */}
      {showDecorations && (
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
      )}
      
      {/* Conteúdo principal */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;
