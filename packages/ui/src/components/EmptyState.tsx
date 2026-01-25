/**
 * Empty State Component
 * 
 * Displays a friendly message when there's no data to show
 */

import React from 'react';
import { cn } from '../lib/cn';

export interface EmptyStateProps {
    /** Icon to display (emoji or icon component) */
    icon?: React.ReactNode;
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Optional action button */
    action?: React.ReactNode;
    /** Optional custom className */
    className?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
    sm: {
        container: 'py-6 px-4',
        icon: 'text-3xl mb-2',
        title: 'text-base',
        description: 'text-sm',
    },
    md: {
        container: 'py-10 px-6',
        icon: 'text-4xl mb-3',
        title: 'text-lg',
        description: 'text-sm',
    },
    lg: {
        container: 'py-16 px-8',
        icon: 'text-5xl mb-4',
        title: 'text-xl',
        description: 'text-base',
    },
};

export function EmptyState({
    icon = '📭',
    title,
    description,
    action,
    className,
    size = 'md',
}: EmptyStateProps) {
    const styles = sizeStyles[size];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                styles.container,
                className
            )}
        >
            {icon && (
                <div className={cn('opacity-80', styles.icon)}>
                    {icon}
                </div>
            )}
            <h3 className={cn('font-semibold text-gray-900', styles.title)}>
                {title}
            </h3>
            {description && (
                <p className={cn('text-gray-500 mt-1 max-w-sm', styles.description)}>
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
}

/**
 * Common empty state presets
 */
export const EmptyStatePresets = {
    noJobs: {
        icon: '💼',
        title: 'No jobs found',
        description: 'Try adjusting your filters or check back later for new opportunities.',
    },
    noApplications: {
        icon: '📋',
        title: 'No applications yet',
        description: 'Browse available jobs and submit your first application.',
    },
    noEarnings: {
        icon: '💰',
        title: 'No earnings yet',
        description: 'Complete shifts to start earning.',
    },
    noNotifications: {
        icon: '🔔',
        title: 'All caught up!',
        description: 'No new notifications.',
    },
    noAgents: {
        icon: '👥',
        title: 'No agents found',
        description: 'No agents match your search criteria.',
    },
    noResults: {
        icon: '🔍',
        title: 'No results found',
        description: 'Try different search terms or filters.',
    },
    error: {
        icon: '⚠️',
        title: 'Something went wrong',
        description: 'We couldn\'t load this content. Please try again.',
    },
};
