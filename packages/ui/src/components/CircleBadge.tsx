import React from 'react';
import { cn } from '../lib/cn';

export type CircleLevel = 'center' | 'inner' | 'mid' | 'outer' | 'public';

export interface CircleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Trust circle level */
    level: CircleLevel;
    /** Size of the badge */
    size?: 'sm' | 'md' | 'lg';
    /** Show the level label */
    showLabel?: boolean;
}

const circleColors: Record<CircleLevel, string> = {
    center: 'bg-circle-center/20 text-circle-center border-circle-center',
    inner: 'bg-circle-inner/20 text-circle-inner border-circle-inner',
    mid: 'bg-circle-mid/20 text-circle-mid border-circle-mid',
    outer: 'bg-circle-outer/20 text-circle-outer border-circle-outer',
    public: 'bg-circle-public/20 text-circle-public border-circle-public',
};

const circleLabels: Record<CircleLevel, string> = {
    center: 'Center',
    inner: 'Inner',
    mid: 'Mid',
    outer: 'Outer',
    public: 'Public',
};

const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
};

/**
 * Circle badge component for displaying trust levels
 * 
 * @example
 * <CircleBadge level="inner" showLabel />
 */
export const CircleBadge = React.forwardRef<HTMLSpanElement, CircleBadgeProps>(
    ({ className, level, size = 'md', showLabel = true, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center font-medium rounded-full border',
                    circleColors[level],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                <span className={cn(
                    'w-2 h-2 rounded-full mr-1.5',
                    level === 'center' && 'bg-circle-center',
                    level === 'inner' && 'bg-circle-inner',
                    level === 'mid' && 'bg-circle-mid',
                    level === 'outer' && 'bg-circle-outer',
                    level === 'public' && 'bg-circle-public'
                )} />
                {showLabel && circleLabels[level]}
            </span>
        );
    }
);

CircleBadge.displayName = 'CircleBadge';
