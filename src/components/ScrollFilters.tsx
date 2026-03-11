'use client';

export default function ScrollFilters() {
    return (
        <svg className="svg-filters" style={{ visibility: 'hidden', position: 'absolute' }}>
            <defs>
                <filter id="torn-edge">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <filter id="torn-edge-subtle">
                    <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
    );
}
