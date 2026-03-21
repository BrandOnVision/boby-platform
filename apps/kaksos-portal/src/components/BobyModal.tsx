/**
 * BobyModal — STYLE.md compliant shared modal component
 * Replaces all browser native prompt(), alert(), confirm() calls
 *
 * Three variants:
 * - alert: title + message + OK button
 * - confirm: title + message + Cancel + Confirm button
 * - prompt: title + message + text input + Cancel + Submit button
 */

import { useState, useEffect, useRef } from 'react';

interface BobyModalBaseProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
}

interface AlertProps extends BobyModalBaseProps {
    variant: 'alert';
    confirmLabel?: string;
}

interface ConfirmProps extends BobyModalBaseProps {
    variant: 'confirm';
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

interface PromptProps extends BobyModalBaseProps {
    variant: 'prompt';
    onSubmit: (value: string) => void;
    placeholder?: string;
    defaultValue?: string;
    submitLabel?: string;
    cancelLabel?: string;
    required?: boolean;
}

type BobyModalProps = AlertProps | ConfirmProps | PromptProps;

export default function BobyModal(props: BobyModalProps) {
    const { isOpen, onClose, title, message, variant } = props;
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Reset input when modal opens
    useEffect(() => {
        if (isOpen && variant === 'prompt') {
            setInputValue((props as PromptProps).defaultValue || '');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    function handleConfirm() {
        if (variant === 'confirm') {
            (props as ConfirmProps).onConfirm();
        }
        onClose();
    }

    function handleSubmit() {
        if (variant === 'prompt') {
            const p = props as PromptProps;
            if (p.required && !inputValue.trim()) return;
            p.onSubmit(inputValue.trim());
        }
        onClose();
    }

    const isDestructive = variant === 'confirm' && (props as ConfirmProps).destructive;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-sm mx-4"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    {message && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{message}</p>
                    )}
                </div>

                {/* Prompt input */}
                {variant === 'prompt' && (
                    <div className="px-6 pt-2">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={(props as PromptProps).placeholder || ''}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-800 resize-none focus:border-[#FFD952] focus:outline-none transition-colors"
                        />
                    </div>
                )}

                {/* Buttons */}
                <div className="px-6 pb-6 pt-4 flex justify-end gap-3">
                    {variant === 'alert' && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                            style={{ background: '#FFD952', color: '#303030' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F2C94C')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFD952')}
                        >
                            {(props as AlertProps).confirmLabel || 'OK'}
                        </button>
                    )}

                    {variant === 'confirm' && (
                        <>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                {(props as ConfirmProps).cancelLabel || 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                                style={isDestructive
                                    ? { background: '#FF6B66', color: '#FFFFFF' }
                                    : { background: '#FFD952', color: '#303030' }
                                }
                                onMouseEnter={(e) => (e.currentTarget.style.background = isDestructive ? '#e55b56' : '#F2C94C')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = isDestructive ? '#FF6B66' : '#FFD952')}
                            >
                                {(props as ConfirmProps).confirmLabel || 'Confirm'}
                            </button>
                        </>
                    )}

                    {variant === 'prompt' && (
                        <>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                {(props as PromptProps).cancelLabel || 'Cancel'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={(props as PromptProps).required && !inputValue.trim()}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                style={{ background: '#FFD952', color: '#303030' }}
                                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#F2C94C'; }}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFD952')}
                            >
                                {(props as PromptProps).submitLabel || 'Submit'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}