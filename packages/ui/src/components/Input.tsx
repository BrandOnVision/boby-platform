import React from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Label text */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Error message */
    error?: string;
    /** Left addon (icon or text) */
    leftAddon?: React.ReactNode;
    /** Right addon (icon or text) */
    rightAddon?: React.ReactNode;
}

/**
 * Input component with label, helper text, and error states
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   helperText="We'll never share your email"
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, helperText, error, leftAddon, rightAddon, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftAddon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            {leftAddon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'block w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900',
                            'placeholder:text-gray-400',
                            'transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            error
                                ? 'border-boby-danger focus:border-boby-danger focus:ring-red-500/20'
                                : 'border-gray-300 focus:border-boby-primary focus:ring-boby-primary/20',
                            leftAddon && 'pl-10',
                            rightAddon && 'pr-10',
                            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                            className
                        )}
                        {...props}
                    />
                    {rightAddon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                            {rightAddon}
                        </div>
                    )}
                </div>
                {(helperText || error) && (
                    <p
                        className={cn(
                            'mt-1.5 text-sm',
                            error ? 'text-boby-danger' : 'text-gray-500'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
