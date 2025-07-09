import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-100',
        destructive: 'bg-danger-600 text-white hover:bg-danger-700',
        success: 'bg-success-600 text-white hover:bg-success-700',
        warning: 'bg-warning-600 text-white hover:bg-warning-700',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        gradient: 'bg-gradient-to-r from-primary-600 to-purple-600 text-white',
        glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white',
      },
      size: {
        default: 'text-xs',
        sm: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Badge = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export default Badge;
