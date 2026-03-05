'use client';

import { ReactNode } from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface AnimatedButtonProps {
    children: ReactNode;
    icon?: LucideIcon;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit';
}

export default function AnimatedButton({
    children,
    icon: Icon,
    onClick,
    className = '',
    type = 'button'
}: AnimatedButtonProps) {
    const ActualIcon = Icon || ChevronRight;

    return (
        <button
            type={type}
            onClick={onClick}
            className={`animated-button ${className}`}
        >
            <ActualIcon className="arr-2" />
            <span className="text">{children}</span>
            <span className="circle"></span>
            <ActualIcon className="arr-1" />
        </button>
    );
}
