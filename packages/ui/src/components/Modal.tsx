import React, { useEffect, useCallback } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';

export interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal description */
    description?: string;
    /** Modal content */
    children?: React.ReactNode;
    /** Size of the modal */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show close button */
    showCloseButton?: boolean;
    /** Whether clicking backdrop closes modal */
    closeOnBackdrop?: boolean;
}

const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

/**
 * Modal dialog component - Boby branded
 * Implements Anti-Confirm Mandate (replaces native browser dialogs)
 * 
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 * >
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={onCancel}>Cancel</Button>
 *     <Button variant="primary" onClick={onConfirm}>Confirm</Button>
 *   </ModalFooter>
 * </Modal>
 */
export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
}: ModalProps) {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm animate-fade-in"
                onClick={closeOnBackdrop ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-xl shadow-xl animate-slide-up',
                    sizeStyles[size]
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between p-6 border-b border-grey-200">
                        <div>
                            {title && (
                                <h2 id="modal-title" className="text-lg font-bold text-text-primary">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-text-muted">{description}</p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-grey-100 transition-colors"
                                aria-label="Close modal"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

/**
 * Modal footer for action buttons
 */
export function ModalFooter({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-grey-200',
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * Confirmation modal - common pattern
 */
export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-text-secondary">{message}</p>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmText}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
