'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoIntro from './VideoIntro';
import Chatbot from './Chatbot';
import { usePathname } from 'next/navigation';


export const IntroContext = createContext({
    introComplete: false,
    setIntroComplete: (() => { }) as (val: boolean) => void,
});

export const useIntro = () => useContext(IntroContext);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    const [introComplete, setIntroComplete] = useState(false);
    const [isLoopFading, setIsLoopFading] = useState(false);
    const [bgVideoReady, setBgVideoReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const backgroundPlayedRef = useRef(false);
    const startTimeRef = useRef<number | null>(null);

    const bgVideoSrc = '/bg_best_vid.mp4';

    // Sync timing and handle manual loop fading
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video) {
            const loopPoint = 5.0; // User requested 5s duration
            const fadePoint = 1.0; // 1s fade in/out

            // Fade out starts at loopPoint - fadePoint
            if (video.currentTime >= loopPoint - fadePoint && video.currentTime < loopPoint) {
                if (!isLoopFading) setIsLoopFading(true);
            }

            // Force reset if it exceeds 5s
            if (video.currentTime >= loopPoint) {
                video.currentTime = 0;
                video.play().catch(() => { });
                setIsLoopFading(false);
            }

            // Normal operation outside fade zone
            if (video.currentTime < loopPoint - fadePoint && video.currentTime > fadePoint) {
                if (isLoopFading) setIsLoopFading(false);
            }
        }
    };

    const handleVideoLoop = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            video.currentTime = 0;
            video.play().catch(() => { });
            setIsLoopFading(false);
        }
    };

    useEffect(() => {
        // Sync video timing with wall-clock to ensure it "progresses" in the background
        const syncVideo = () => {
            if (document.visibilityState === 'visible' && startTimeRef.current && videoRef.current) {
                const video = videoRef.current;
                const totalElapsed = (Date.now() - startTimeRef.current) / 1000;
                const seekTime = totalElapsed % 5.0; // Loop every 5s

                if (Math.abs(video.currentTime - seekTime) > 0.5) {
                    video.currentTime = seekTime;
                    video.play().catch(() => { });
                }
            }
        };

        document.addEventListener('visibilitychange', syncVideo);
        return () => document.removeEventListener('visibilitychange', syncVideo);
    }, []);

    useEffect(() => {
        if ((introComplete || !isLandingPage) && videoRef.current && !backgroundPlayedRef.current) {
            const video = videoRef.current;
            // Lazy-load: set source only when needed
            if (!video.src || video.src === '') {
                video.src = bgVideoSrc;
                video.load();
            }
            const onCanPlay = () => {
                setBgVideoReady(true);
                video.play().then(() => {
                    if (!startTimeRef.current) startTimeRef.current = Date.now();
                }).catch(() => { });
                video.removeEventListener('canplay', onCanPlay);
            };
            video.addEventListener('canplay', onCanPlay);
            backgroundPlayedRef.current = true;
        }
    }, [introComplete, isLandingPage, bgVideoSrc]);

    return (
        <IntroContext.Provider value={{ introComplete, setIntroComplete }}>
            {/* Global Solid Background - Prevents white flash */}
            <div className="fixed inset-0 bg-manthan-black -z-20" />

            {/* Global Intro - Handles both first load and refresh */}
            <AnimatePresence mode="wait">
                {isLandingPage && !introComplete && (
                    <VideoIntro key="intro" onComplete={() => setIntroComplete(true)} />
                )}
            </AnimatePresence>

            {/* Global Background Video - Lazy loaded, Manual Looping with Fades */}
            <video
                ref={videoRef}
                muted
                playsInline
                webkit-playsinline="true"
                preload="none"
                loop={false}
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoLoop}
                className={`fixed top-1/2 left-1/2 min-w-[110%] min-h-[110%] w-auto h-auto object-cover transition-all duration-[1000ms] ease-in-out ${(introComplete || !isLandingPage) && !isLoopFading && bgVideoReady ? 'opacity-40' : 'opacity-0'
                    } pointer-events-none bg-black`}
                style={{
                    height: '110svh',
                    width: '110vw',
                    objectFit: 'cover',
                    zIndex: -1,
                    transform: 'translate(-50%, -50%) scale(1.4)'
                }}
            />

            {/* Source is set dynamically via JS for lazy loading */}

            <motion.div
                initial={false}
                animate={{ opacity: (isLandingPage && !introComplete) ? 0 : 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={(isLandingPage && !introComplete) ? "fixed inset-0 pointer-events-none overflow-hidden bg-transparent" : "relative min-h-screen bg-transparent"}
            >
                {/* Home Page Specific Background Override */}
                {isLandingPage && (
                    <style jsx global>{`
                        body::before {
                            display: none !important;
                        }
                    `}</style>
                )}
                {children}

                {/* Chatbot - Only show after intro or on subpages */}
                {(introComplete || !isLandingPage) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                    >
                        <Chatbot />
                    </motion.div>
                )}
            </motion.div>
        </IntroContext.Provider>
    );
}
