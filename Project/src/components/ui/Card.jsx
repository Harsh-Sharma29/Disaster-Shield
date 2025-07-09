import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700',
        glass: 'bg-white/20 backdrop-blur-md border-white/30 shadow-glass',
        gradient: 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border-gray-200/50 shadow-lg',
        elevated: 'bg-white border-gray-200 shadow-lg hover:shadow-xl dark:bg-gray-800 dark:border-gray-700',
        outlined: 'bg-transparent border-2 border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:transform hover:-translate-y-1',
        glow: 'hover:shadow-glow',
        scale: 'hover:scale-105',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      hover: 'none',
    },
  }
);

const Card = React.forwardRef(({ className, variant, padding, hover, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, padding, hover, className }))}
    {...props}
  />
));

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;
