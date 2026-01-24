import React from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Visual style variant */
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Make the card interactive (hoverable) */
    interactive?: boolean;
}

const variantStyles = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg shadow-gray-200/50',
    outlined: 'bg-transparent border-2 border-gray-300',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
};

/**
 * Card component for containing content
 * 
 * @example
 * <Card variant="elevated" padding="md">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl',
                    variantStyles[variant],
                    paddingStyles[padding],
                    interactive && 'transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Sub-components for structured card content
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => (
    <div className={cn('mb-4', className)} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    children,
    ...props
}) => (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
        {children}
    </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
    className,
    children,
    ...props
}) => (
    <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
        {children}
    </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => (
    <div className={cn('', className)} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)} {...props}>
        {children}
    </div>
);
