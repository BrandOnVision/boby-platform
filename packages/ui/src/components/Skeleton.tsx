/**
 * Skeleton Component
 * 
 * Loading placeholder that mimics content shape
 */

import { cn } from '../lib/cn';

export interface SkeletonProps {
    /** Custom className */
    className?: string;
    /** Width (can be Tailwind class or CSS value) */
    width?: string;
    /** Height (can be Tailwind class or CSS value) */
    height?: string;
    /** Border radius variant */
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    /** Animation variant */
    animation?: 'pulse' | 'shimmer' | 'none';
}

const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
};

export function Skeleton({
    className,
    width,
    height,
    rounded = 'md',
    animation = 'pulse',
}: SkeletonProps) {
    const animationClass = animation === 'pulse'
        ? 'animate-pulse'
        : animation === 'shimmer'
            ? 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]'
            : '';

    return (
        <div
            className={cn(
                'bg-gray-200',
                roundedStyles[rounded],
                animationClass,
                className
            )}
            style={{
                width: width,
                height: height,
            }}
        />
    );
}

/**
 * Skeleton Text - Mimics a line of text
 */
export interface SkeletonTextProps {
    /** Number of lines */
    lines?: number;
    /** Last line width (percentage) */
    lastLineWidth?: string;
    /** Custom className */
    className?: string;
}

export function SkeletonText({
    lines = 1,
    lastLineWidth = '60%',
    className,
}: SkeletonTextProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="1rem"
                    width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
                    rounded="sm"
                />
            ))}
        </div>
    );
}

/**
 * Skeleton Avatar - Circular placeholder
 */
export interface SkeletonAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
    return (
        <Skeleton
            className={cn(avatarSizes[size], className)}
            rounded="full"
        />
    );
}

/**
 * Skeleton Card - Full card placeholder
 */
export interface SkeletonCardProps {
    /** Show avatar */
    showAvatar?: boolean;
    /** Number of text lines */
    lines?: number;
    /** Custom className */
    className?: string;
}

export function SkeletonCard({
    showAvatar = false,
    lines = 3,
    className,
}: SkeletonCardProps) {
    return (
        <div className={cn('bg-white rounded-lg border p-4', className)}>
            <div className="flex gap-3">
                {showAvatar && <SkeletonAvatar />}
                <div className="flex-1">
                    <Skeleton height="1.25rem" width="70%" rounded="sm" className="mb-2" />
                    <SkeletonText lines={lines} />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton Table Row
 */
export interface SkeletonTableRowProps {
    columns?: number;
    className?: string;
}

export function SkeletonTableRow({ columns = 4, className }: SkeletonTableRowProps) {
    return (
        <tr className={className}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton height="1rem" width={i === 0 ? '80%' : '60%'} rounded="sm" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Skeleton List - Multiple list items
 */
export interface SkeletonListProps {
    items?: number;
    showAvatar?: boolean;
    className?: string;
}

export function SkeletonList({
    items = 3,
    showAvatar = false,
    className,
}: SkeletonListProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    {showAvatar && <SkeletonAvatar size="sm" />}
                    <div className="flex-1">
                        <Skeleton height="0.875rem" width={`${80 - i * 10}%`} rounded="sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}
