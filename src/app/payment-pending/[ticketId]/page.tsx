'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageCircle, ArrowRight, Clock3 } from 'lucide-react';

const REDIRECT_SECONDS = 5;

export default function PaymentPendingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const ticketId = params.ticketId as string;

    const coordinatorName = useMemo(() => searchParams.get('coordinator') || 'the coordinator', [searchParams]);
    const coordinatorPhone = useMemo(() => searchParams.get('phone') || '', [searchParams]);
    const whatsappPrefillUrl = useMemo(() => searchParams.get('wa') || '', [searchParams]);
    const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const redirectTimer = window.setTimeout(() => {
            window.location.href = `/confirmation/${ticketId}`;
        }, REDIRECT_SECONDS * 1000);

        return () => {
            window.clearInterval(interval);
            window.clearTimeout(redirectTimer);
        };
    }, [ticketId]);

    const whatsappUrl = whatsappPrefillUrl || (coordinatorPhone ? `https://api.whatsapp.com/send?phone=${coordinatorPhone}` : '');

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <Navbar />

            <div className="absolute top-0 right-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-manthan-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-1 flex items-center justify-center px-4 py-10 pt-24">
                <div className="parchment-container max-w-xl w-full">
                    <div className="scroll-roll h-4" />
                    <div className="parchment-body p-8 sm:p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-manthan-maroon/10 text-manthan-maroon flex items-center justify-center mx-auto mb-5">
                            <MessageCircle size={28} />
                        </div>

                        <h1 className="font-ancient text-2xl sm:text-3xl font-bold text-[#3d2b1f] mb-3 uppercase tracking-wide">
                            Registration Saved
                        </h1>
                        <p className="text-[#5c4033] font-ancient text-sm italic leading-relaxed">
                            Please coordinate with {coordinatorName}
                            {coordinatorPhone ? ` (${coordinatorPhone})` : ''} to complete payment via QR code or UPI link.
                        </p>

                        <div className="mt-6 p-4 rounded-xl border border-manthan-maroon/20 bg-manthan-maroon/5">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-manthan-maroon/50 font-ancient mb-2">Ticket ID</p>
                            <p className="text-manthan-maroon font-ancient text-lg tracking-wider font-bold">{ticketId}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-[#5c4033] text-xs uppercase tracking-widest font-ancient">
                            <Clock3 size={14} />
                            <span>Opening your pass in {secondsLeft}s</span>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                            {whatsappUrl && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-2.5 rounded-full bg-manthan-maroon text-white font-ancient text-xs uppercase tracking-wider hover:bg-manthan-crimson transition-colors"
                                >
                                    Open WhatsApp Again
                                </a>
                            )}
                            <a
                                href={`/confirmation/${ticketId}`}
                                className="px-5 py-2.5 rounded-full border border-manthan-maroon/30 text-manthan-maroon font-ancient text-xs uppercase tracking-wider hover:bg-manthan-maroon/5 transition-colors inline-flex items-center gap-2"
                            >
                                Continue Now
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                    <div className="scroll-roll h-4 rotate-180" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
