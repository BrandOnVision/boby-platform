import React from 'react';
import { cn } from '../lib/cn';

export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** 2-letter code to display */
    code: string;
    /** Size of the marker */
    size?: 'sm' | 'md' | 'lg';
    /** Color variant */
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};

const variantStyles = {
    primary: 'bg-primary text-text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-danger',
    neutral: 'bg-grey-200 text-text-primary',
};

/**
 * 2-letter abbreviation marker - Boby brand standard
 * Replaces emoji icons throughout the platform
 * 
 * @example
 * <Marker code="AG" /> // Agent
 * <Marker code="VN" variant="primary" /> // Venue
 * <Marker code="JB" size="lg" /> // Job
 */
export const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
    ({ className, code, size = 'md', variant = 'primary', ...props }, ref) => {
        // Ensure code is max 2 characters
        const displayCode = code.slice(0, 2).toUpperCase();

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-lg flex items-center justify-center font-bold shrink-0',
                    sizeStyles[size],
                    variantStyles[variant],
                    className
                )}
                {...props}
            >
                {displayCode}
            </div>
        );
    }
);

Marker.displayName = 'Marker';
