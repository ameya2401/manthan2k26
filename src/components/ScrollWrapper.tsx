'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollWrapperProps {
    children: ReactNode;
    className?: string;
    padding?: string;
    speed?: number;
}

export default function ScrollWrapper({ children, className = '', padding = 'p-8 md:p-12', speed = 1 }: ScrollWrapperProps) {
    return (
        <motion.div
            initial="closed"
            whileInView="open"
            viewport={{ once: true, margin: "400px" }}
            className={`parchment-container ${className}`}
        >
            <div className="scroll-roll" />

            <motion.div
                variants={{
                    closed: { opacity: 0 },
                    open: { opacity: 1 }
                }}
                transition={{ duration: speed === 1 ? 0.2 : speed, ease: speed === 1 ? "linear" : "easeOut" }}
                className={`parchment-body ${padding}`}
            >
                {children}
            </motion.div>

            <div className="scroll-roll" />
        </motion.div>
    );
}
