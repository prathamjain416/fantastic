import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] duration-200 min-h-[44px] min-w-[44px] touch-manipulation',
        {
          'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20': variant === 'primary',
          'bg-secondary text-white hover:bg-secondary/90': variant === 'secondary',
          'border-2 border-primary text-primary hover:bg-primary/5': variant === 'outline',
        },
        {
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2.5 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};