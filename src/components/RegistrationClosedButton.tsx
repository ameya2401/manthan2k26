'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ScrollText, X } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

type RegistrationClosedButtonVariant = 'animated' | 'solid';

interface RegistrationClosedButtonProps {
    children: ReactNode;
    className?: string;
    variant?: RegistrationClosedButtonVariant;
    onPress?: () => void;
    onClose?: () => void;
    contextLabel?: string;
}

export default function RegistrationClosedButton({
    children,
    className = '',
    variant = 'solid',
    onPress,
    onClose,
    contextLabel,
}: RegistrationClosedButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        const onEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                onClose?.();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onEsc);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onEsc);
        };
    }, [isOpen, onClose]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    const handleOpen = () => {
        onPress?.();
        setIsOpen(true);
    };

    return (
        <>
            {variant === 'animated' ? (
                <AnimatedButton onClick={handleOpen} className={className} icon={Sparkles}>
                    {children}
                </AnimatedButton>
            ) : (
                <button type="button" onClick={handleOpen} className={className}>
                    {children}
                </button>
            )}

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="registration-closed-title"
                        >
                            <button
                                type="button"
                                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                                onClick={handleClose}
                                aria-label="Close popup"
                            />

                            <motion.div
                                initial={{ y: 24, opacity: 0, scale: 0.98 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="relative z-10 w-full max-w-xl parchment-container rounded-none border border-manthan-gold/30 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
                            >
                                <div className="scroll-roll" />
                                <div className="parchment-body p-6 sm:p-8 text-[#3d2b1f]">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="absolute right-4 top-4 rounded-full border border-manthan-maroon/20 bg-white/50 p-1.5 text-manthan-maroon hover:bg-white/80 transition-colors"
                                        aria-label="Close popup"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-manthan-gold/40 bg-manthan-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-manthan-maroon">
                                        <ScrollText size={14} />
                                        Manthan Chronicle
                                    </div>

                                    <h2 id="registration-closed-title" className="font-ancient text-3xl sm:text-4xl text-manthan-maroon leading-tight">
                                        Registrations Are Closed
                                    </h2>

                                    <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#5c4033]">
                                        The scrolls of Manthan 2026 are now sealed. Thank you for the amazing energy, spirit, and participation.
                                    </p>

                                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#5c4033]">
                                        We will return with a new chapter next year. See you at Manthan 2027.
                                        {contextLabel ? ` ${contextLabel}` : ''}
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-5 py-2.5 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-semibold rounded-md shadow-lg shadow-manthan-maroon/25 hover:brightness-110 transition-all"
                                        >
                                            Understood
                                        </button>
                                    </div>
                                </div>
                                <div className="scroll-roll" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
