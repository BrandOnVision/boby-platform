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

// Trust tier colors from brand standards
const circleColors: Record<CircleLevel, string> = {
    center: 'bg-tier-1/20 text-tier-1 border-tier-1',   // Gold - Highest trust
    inner: 'bg-tier-2/20 text-tier-2 border-tier-2',    // Blue
    mid: 'bg-tier-3/20 text-tier-3 border-tier-3',      // Green
    outer: 'bg-tier-4/20 text-tier-4 border-tier-4',    // Amber
    public: 'bg-tier-5/20 text-tier-5 border-tier-5',   // Grey
};

const circleLabels: Record<CircleLevel, string> = {
    center: 'Center',
    inner: 'Inner',
    mid: 'Mid',
    outer: 'Outer',
    public: 'Public',
};

// 2-letter markers instead of colored dots (brand standard)
const circleMarkers: Record<CircleLevel, string> = {
    center: 'C1',
    inner: 'C2',
    mid: 'C3',
    outer: 'C4',
    public: 'C5',
};

const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
};

/**
 * Circle badge component for displaying trust levels
 * Uses 5-tier color system from brand standards
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
                    'inline-flex items-center font-medium rounded border',
                    circleColors[level],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {/* 2-letter marker instead of colored dot */}
                <span className="font-bold mr-1.5">{circleMarkers[level]}</span>
                {showLabel && circleLabels[level]}
            </span>
        );
    }
);

CircleBadge.displayName = 'CircleBadge';
