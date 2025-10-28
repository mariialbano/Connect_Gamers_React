import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ 
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = '',
  ...props 
}) => {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-neutral-600 dark:text-neutral-400',
  };
  
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };
  
  return (
    <motion.div
      className={`p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-soft hover:shadow-medium transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <span className="text-primary-600 dark:text-primary-400 text-xl">
                {icon}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {title}
            </h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trendColors[trend]}`}>
            <span className="text-sm font-medium">
              {trendIcons[trend]}
            </span>
            <span className="text-sm font-medium">
              {trendValue}
            </span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
