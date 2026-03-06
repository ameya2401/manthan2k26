'use client';

import { ReactNode } from 'react';
import { LucideIcon, ChevronRight, Sparkles, ArrowRight, Send } from 'lucide-react';

const icons = {
    sparkles: Sparkles,
    'arrow-right': ArrowRight,
    send: Send,
    'chevron-right': ChevronRight,
};

type IconName = keyof typeof icons;

interface AnimatedButtonProps {
    children: ReactNode;
    icon?: LucideIcon | IconName;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit';
}

export default function AnimatedButton({
    children,
    icon,
    onClick,
    className = '',
    type = 'button'
}: AnimatedButtonProps) {
    const IconNode = typeof icon === 'string' ? icons[icon] : icon;
    const ActualIcon = IconNode || ChevronRight;

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
