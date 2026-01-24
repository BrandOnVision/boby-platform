import React from 'react';
import { cn } from '../lib/cn';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    /** Label text */
    label?: string;
    /** Helper text below select */
    helperText?: string;
    /** Error message */
    error?: string;
    /** Options to display */
    options: SelectOption[];
    /** Placeholder text */
    placeholder?: string;
}

/**
 * Select dropdown with Boby brand styling
 * Uses gold highlight for selected options
 * 
 * @example
 * <Select
 *   label="Role"
 *   options={[
 *     { value: 'agent', label: 'Security Agent' },
 *     { value: 'manager', label: 'Manager' },
 *   ]}
 * />
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, helperText, error, options, placeholder, id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-text-primary mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'block w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-text-primary',
                            'appearance-none cursor-pointer',
                            'transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            error
                                ? 'border-danger focus:border-danger focus:ring-danger/20'
                                : 'border-grey-300 focus:border-primary focus:ring-primary/20',
                            'disabled:bg-grey-100 disabled:text-text-muted disabled:cursor-not-allowed',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {(helperText || error) && (
                    <p
                        className={cn(
                            'mt-1.5 text-sm',
                            error ? 'text-danger' : 'text-text-muted'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
