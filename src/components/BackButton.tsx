'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

export default function BackButton() {
    return (
        <Link
            href="/events"
            className="inline-block transform scale-90 -translate-x-4 mb-6"
        >
            <AnimatedButton icon={ArrowLeft}>
                Back to Events
            </AnimatedButton>
        </Link>
    );
}
