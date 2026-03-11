'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import VideoIntro from './VideoIntro';
import LogoLoading from './LogoLoading';
const Chatbot = dynamic(() => import('./Chatbot'), { ssr: false });
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
    const [isPreloading, setIsPreloading] = useState(isLandingPage); // Only preload if on landing page
    const [isLoopFading, setIsLoopFading] = useState(false);
    const [bgVideoReady, setBgVideoReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const backgroundPlayedRef = useRef(false);
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bgVideoSrc = 'https://manthan-cdn.ameyabhagat24.workers.dev/extended.mp4';
    const targetOpacity = 0.46;
    const loopFadeOpacity = 0.28;

    useEffect(() => {

        if (!isLandingPage) {
            setIsPreloading(false);
            return;
        }

        // Logic for landing page: Wait for the intro video to be ready
        const introVideoSrc = 'https://manthan-cdn.ameyabhagat24.workers.dev/p2.mp4';
        const v = document.createElement('video');
        v.src = introVideoSrc;
        v.preload = 'auto';
        
        const handleVideoReady = () => {
            setIsPreloading(false);
        };

        // If video is already cached, it might be ready very quickly
        v.addEventListener('canplaythrough', handleVideoReady);
        
        // Safety fallback: Don't keep user waiting forever if there's a network issue
        const timer = setTimeout(handleVideoReady, 6000); 

        return () => {
            v.removeEventListener('canplaythrough', handleVideoReady);
            clearTimeout(timer);
        };
    }, [isLandingPage]);

    // Fade near the natural end of the clip so final frames are always visible.
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video) {
            const duration = video.duration;
            const fadeDuration = 0.25;
            if (!Number.isFinite(duration) || duration <= 0) return;

            if (video.currentTime >= duration - fadeDuration && video.currentTime < duration) {
                if (!isLoopFading) {
                    setIsLoopFading(true);
                }
            } else if (isLoopFading && video.currentTime < duration - fadeDuration) {
                setIsLoopFading(false);
            }
        }
    };
    
    // ... handleVideoLoop and other effects ...

    const handleVideoLoop = () => {
        const video = videoRef.current;
        if (!video) return;

        setIsLoopFading(true);

        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
            video.currentTime = 0;
            video.play().catch(() => { });
            setIsLoopFading(false);
        }, 280);
    };

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
                // Reduced delay to ensure intro transition is snappier
                setTimeout(() => {
                    video.currentTime = 0;
                    if (video) video.play().catch(() => { });
                }, 300); // Shorter delay for faster transition
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

            {/* Global Intro Sequence - Chained transition */}
            <AnimatePresence mode="wait">
                {isPreloading ? (
                    <motion.div
                        key="logo-loading-layer"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden"
                    >
                        <LogoLoading />
                        {/* Ambient Glow behind logo */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
                    </motion.div>
                ) : (isLandingPage && !introComplete) ? (
                    <VideoIntro key="video-intro-layer" onComplete={() => setIntroComplete(true)} />
                ) : null}
            </AnimatePresence>

            {/* Global Background Video - Optimized loading */}
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
                className="fixed top-1/2 left-1/2 min-w-[110%] min-h-[110%] w-auto h-auto object-cover transition-opacity duration-500 ease-out pointer-events-none bg-black will-change-opacity gpu-accelerated"
                style={{
                    opacity: (introComplete || !isLandingPage) && bgVideoReady
                        ? (isLoopFading ? loopFadeOpacity : targetOpacity)
                        : 0,
                    height: '110svh',
                    width: '110vw',
                    objectFit: 'cover',
                    zIndex: -1,
                    transform: 'translate(-50%, -50%) scale(1.4)'
                }}
            />

            <motion.div
                initial={false}
                animate={{ opacity: (isLandingPage && !introComplete) ? 0 : 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`will-change-opacity ${(isLandingPage && !introComplete) ? "fixed inset-0 pointer-events-none overflow-hidden bg-transparent" : "relative min-h-screen bg-transparent"}`}
            >
                {/* Home Page Specific Background Override */}
                <style jsx global>{`
                    body::before {
                        display: none !important;
                    }
                `}</style>
                {children}

                {/* Chatbot - Prioritized delay */}
                {(introComplete || !isLandingPage) && !pathname?.startsWith('/admin') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 3 }} // Further delay to prioritize main content
                    >
                        <Chatbot />
                    </motion.div>
                )}
            </motion.div>
        </IntroContext.Provider>
    );
}
