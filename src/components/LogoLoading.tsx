'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LogoLoading() {
    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* The Logo with a subtle breathing effect */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{
                    scale: [0.95, 1.02, 0.95],
                    opacity: [0.8, 1, 0.8]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
            >
                <Image
                    src="/manthan_final_logo.png"
                    alt="Manthan Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                    priority
                />
            </motion.div>

            {/* Attractive Atmospheric Text */}
            <div className="mt-12 flex flex-col items-center gap-3">
                <motion.span
                    className="text-[#d4af37] font-ancient tracking-[0.4em] uppercase text-sm md:text-base text-center px-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    The Chronicles of Manthan Await
                </motion.span>

                <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className="text-[#d4af37]/60 font-serif italic text-xs tracking-widest text-center">
                        Awakening the Legend...
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
