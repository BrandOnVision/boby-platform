import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../lib/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook to use toast notifications
 * 
 * @example
 * const { addToast } = useToast();
 * addToast({ type: 'success', title: 'Saved!', message: 'Your changes have been saved.' });
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

/**
 * Toast provider - wrap your app with this
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

const typeStyles: Record<ToastType, string> = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-text-primary',
    info: 'bg-tier-2 text-white',
};

const typeMarkers: Record<ToastType, string> = {
    success: 'OK',
    error: 'ER',
    warning: 'WN',
    info: 'IN',
};

/**
 * Toast container - renders all active toasts
 */
function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

/**
 * Individual toast item
 */
function ToastItem({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-up',
                typeStyles[toast.type]
            )}
            role="alert"
        >
            {/* Type marker (2-letter) */}
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                {typeMarkers[toast.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold">{toast.title}</p>
                {toast.message && (
                    <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 rounded hover:bg-white/20 transition-colors shrink-0"
                aria-label="Dismiss"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
