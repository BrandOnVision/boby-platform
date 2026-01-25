/**
 * Toggle Switch Component
 * 
 * A styled toggle switch for boolean settings
 */

import { cn } from '../lib/cn';

export interface ToggleProps {
    /** Whether the toggle is on */
    checked: boolean;
    /** Change handler */
    onChange: (checked: boolean) => void;
    /** Label text */
    label?: string;
    /** Description text */
    description?: string;
    /** Whether the toggle is disabled */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Custom className */
    className?: string;
}

const sizeStyles = {
    sm: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4',
    },
    md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
    },
    lg: {
        track: 'w-14 h-8',
        thumb: 'w-6 h-6',
        translate: 'translate-x-6',
    },
};

export function Toggle({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    className,
}: ToggleProps) {
    const styles = sizeStyles[size];

    return (
        <label
            className={cn(
                'flex items-center gap-3 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    'relative inline-flex shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
                    styles.track,
                    checked ? 'bg-amber-500' : 'bg-gray-200',
                    disabled && 'cursor-not-allowed'
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
                        styles.thumb,
                        'transform',
                        checked ? styles.translate : 'translate-x-0.5',
                        'mt-0.5'
                    )}
                />
            </button>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span className="text-sm font-medium text-gray-900">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-sm text-gray-500">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
}
