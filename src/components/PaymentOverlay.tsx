'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentOverlayProps {
    isOpen: boolean;
    status: 'verifying' | 'success' | 'redirecting' | 'error';
    errorMessage?: string;
    onClose?: () => void;
}

const statusMessages = {
    verifying: [
        "Verifying payment details...",
        "Connecting to secure server...",
        "Confirming transaction status...",
        "Finalizing your registration..."
    ],
    success: [
        "Payment successful!",
        "Payment confirmed by provider.",
        "Generating your digital event pass...",
        "Registration confirmed."
    ],
    redirecting: [
        "Preparing your dashboard...",
        "Redirecting to confirmation page...",
        "Almost there!"
    ],
    error: [
        "Payment verification failed.",
        "Transaction could not be verified.",
        "Please check your bank statement."
    ]
};

export default function PaymentOverlay({ isOpen, status, errorMessage }: PaymentOverlayProps) {
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        if (!isOpen) {
            setLines([]);
            return;
        }

        const currentLines = statusMessages[status] || [];
        let index = 0;
        setLines([currentLines[0]]);

        const interval = setInterval(() => {
            index++;
            if (index < currentLines.length) {
                setLines(prev => [...prev, currentLines[index]]);
            } else {
                clearInterval(interval);
            }
        }, 600); // Faster interval for business feel

        return () => clearInterval(interval);
    }, [isOpen, status]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-manthan-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative w-full max-w-md overflow-hidden"
                    >
                        {/* Status Container */}
                        <div className="parchment-theme border-2 border-manthan-gold/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] relative">
                            {/* Texture */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] mix-blend-multiply" />
                            
                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Static Logo */}
                                <div className="w-20 h-20 mb-6 relative">
                                    <Image
                                        src="/manthan_final_logo.png"
                                        alt="Manthan Logo"
                                        fill
                                        className="object-contain drop-shadow-[0_0_15px_rgba(212,168,55,0.2)]"
                                    />
                                </div>

                                <h2 className="text-manthan-maroon font-ancient text-lg font-bold uppercase tracking-wider mb-6">
                                    {status === 'error' ? 'Payment Failed' : 'Payment Verification'}
                                </h2>

                                {/* Dynamic Lines */}
                                <div className="space-y-3 w-full min-h-[140px]">
                                    <AnimatePresence mode="popLayout">
                                        {lines.map((line, idx) => (
                                            <motion.div
                                                key={line}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-3 text-left"
                                            >
                                                <div className="shrink-0">
                                                    {status === 'success' ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : idx === lines.length - 1 && status !== 'error' ? (
                                                        <Loader2 className="w-4 h-4 text-manthan-maroon animate-spin" />
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-manthan-gold" />
                                                    )}
                                                </div>
                                                <p className="text-sm font-ancient text-manthan-maroon/90 font-medium">
                                                    {line}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {status === 'success' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mt-4 flex flex-col items-center gap-2"
                                    >
                                        <div className="p-2 bg-green-100 rounded-full border border-green-500/20">
                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Transaction Verified</p>
                                    </motion.div>
                                ) || status === 'error' && (
                                    <div className="mt-6 text-manthan-crimson text-xs font-bold uppercase tracking-wider bg-red-50 p-3 rounded-lg border border-manthan-crimson/20">
                                        {errorMessage || "An error occurred."}
                                    </div>
                                )}

                                {status !== 'error' && (
                                    <div className="mt-8 flex items-center gap-2 text-[9px] text-manthan-maroon/40 font-ancient uppercase tracking-[0.2em]">
                                        <Loader2 size={10} className="animate-spin" />
                                        <span>Processing Request...</span>
                                    </div>
                                )}
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-manthan-gold/30 rounded-tl" />
                            <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-manthan-gold/30 rounded-tr" />
                            <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-manthan-gold/30 rounded-bl" />
                            <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-manthan-gold/30 rounded-br" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
