/**
 * Status Badge Component
 * 
 * Displays status with appropriate color coding
 * Used for job status, application status, etc.
 */

import React from 'react';
import { cn } from '../lib/cn';

export type StatusType =
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'pending'
    | 'active'
    | 'completed'
    | 'cancelled';

export interface StatusBadgeProps {
    /** The status text to display */
    children: React.ReactNode;
    /** The type/color of the status */
    type?: StatusType;
    /** Optional size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Optional custom className */
    className?: string;
    /** Show a dot indicator */
    showDot?: boolean;
}

const typeStyles: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const dotStyles: Record<StatusType, string> = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
    pending: 'bg-yellow-500',
    active: 'bg-emerald-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-400',
};

const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
};

export function StatusBadge({
    children,
    type = 'neutral',
    size = 'md',
    className,
    showDot = false,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full border',
                typeStyles[type],
                sizeStyles[size],
                className
            )}
        >
            {showDot && (
                <span
                    className={cn(
                        'w-2 h-2 rounded-full',
                        dotStyles[type]
                    )}
                />
            )}
            {children}
        </span>
    );
}

/**
 * Helper function to determine status type from common status strings
 */
export function getStatusType(status: string): StatusType {
    const statusLower = status.toLowerCase();

    if (['open', 'active', 'available', 'confirmed', 'approved'].includes(statusLower)) {
        return 'active';
    }
    if (['completed', 'done', 'finished', 'paid', 'accepted'].includes(statusLower)) {
        return 'success';
    }
    if (['pending', 'submitted', 'waiting', 'processing'].includes(statusLower)) {
        return 'pending';
    }
    if (['cancelled', 'closed', 'expired', 'inactive'].includes(statusLower)) {
        return 'cancelled';
    }
    if (['rejected', 'failed', 'error', 'declined'].includes(statusLower)) {
        return 'error';
    }
    if (['urgent', 'warning', 'attention'].includes(statusLower)) {
        return 'warning';
    }

    return 'neutral';
}
