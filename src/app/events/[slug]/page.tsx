import { Event } from '@/lib/types';
import { formatFee, formatDateTime, categoryColors, categoryIcons } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, IndianRupee, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import ScrollWrapper from '@/components/ScrollWrapper';
import AnimatedButton from '@/components/AnimatedButton';

import { getEventBySlug } from '@/lib/events-catalog';

async function getEvent(slug: string): Promise<Event | null> {
    return getEventBySlug(slug) || null;
}

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({
    params,
}: {
    params: { slug: string };
}) {
    const event = await getEvent(params.slug);

    if (!event) {
        notFound();
    }

    const colors = categoryColors[event.category] || categoryColors.technical;
    const spotsLeft = event.max_participants - event.current_participants;

    const teamInfo = (() => {
        if (event.team_size_fixed && event.team_size_fixed > 1) {
            return `Team of ${event.team_size_fixed}`;
        }
        if (event.team_size_min && event.team_size_max && event.team_size_max > 1) {
            return `Team size ${event.team_size_min}-${event.team_size_max}`;
        }
        if (event.team_size > 1) {
            return event.team_size_fixed ? `Team of ${event.team_size}` : `Up to ${event.team_size} members`;
        }
        return 'Individual';
    })();

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Back Link */}
                    <Link
                        href="/events"
                        className="inline-flex items-center text-gray-400 hover:text-manthan-gold transition-colors mb-8"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Events
                    </Link>

                    {/* Event Scroll Container */}
                    <ScrollWrapper padding="p-8 md:p-16">
                        {/* Category Badge */}
                        <div className="flex justify-center mb-8">
                            <span className={`inline-block px-6 py-2 text-xs font-ancient uppercase tracking-widest rounded-full border border-manthan-maroon/20 text-manthan-maroon bg-manthan-maroon/5`}>
                                {categoryIcons[event.category]} {event.category} Realm
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="font-ancient text-4xl sm:text-6xl text-[#3d2b1f] mb-6 leading-tight text-center">
                            {event.name}
                        </h1>

                        <div className="w-24 h-[1px] bg-manthan-maroon/20 mx-auto mb-10" />

                        {/* Description */}
                        <p className="font-serif italic text-[#5c4033] text-xl leading-relaxed mb-12 text-center">{event.description}</p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <div className="flex items-center space-x-4 p-5 rounded-xl border border-manthan-maroon/10 bg-black/5">
                                <Calendar size={24} className="text-manthan-maroon" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-manthan-maroon/60">Chronicle Date</p>
                                    <p className="text-[#3d2b1f] font-ancient font-bold">{formatDateTime(event.event_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border border-manthan-maroon/10 bg-black/5">
                                <MapPin size={24} className="text-manthan-maroon" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-manthan-maroon/60">The Arena</p>
                                    <p className="text-[#3d2b1f] font-ancient font-bold">{event.venue}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border border-manthan-maroon/10 bg-black/5">
                                <Users size={24} className="text-manthan-maroon" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-manthan-maroon/60">Fellowship</p>
                                    <p className="text-[#3d2b1f] font-ancient font-bold">{teamInfo}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border border-manthan-maroon/10 bg-black/5">
                                <IndianRupee size={24} className="text-manthan-maroon" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-manthan-maroon/60">Entrance Fee</p>
                                    <p className="text-[#3d2b1f] font-ancient font-bold">{formatFee(event.fee)}</p>
                                </div>
                            </div>
                        </div>

                        {(event.prize_text || event.prize_winner || event.prize_runner_up) && (
                            <div className="mb-12 p-8 border border-manthan-maroon/10 bg-manthan-maroon/5 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles size={48} className="text-manthan-maroon" />
                                </div>
                                <h2 className="font-ancient text-2xl text-manthan-maroon mb-6">Bounties of Victory</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {event.prize_winner && (
                                        <div className="p-4 bg-white/50 rounded-xl border border-manthan-maroon/5">
                                            <p className="text-[10px] uppercase tracking-widest text-manthan-maroon/60 mb-1">Champion</p>
                                            <p className="text-2xl font-ancient text-[#3d2b1f]">{formatFee(event.prize_winner)}</p>
                                        </div>
                                    )}
                                    {event.prize_runner_up && (
                                        <div className="p-4 bg-white/50 rounded-xl border border-manthan-maroon/5">
                                            <p className="text-[10px] uppercase tracking-widest text-manthan-maroon/60 mb-1">Noble Rival</p>
                                            <p className="text-2xl font-ancient text-[#3d2b1f]">{formatFee(event.prize_runner_up)}</p>
                                        </div>
                                    )}
                                </div>
                                {event.prize_text && <p className="mt-6 text-sm italic text-[#5c4033]">{event.prize_text}</p>}
                            </div>
                        )}

                        {/* Rules */}
                        {event.rules && event.rules.length > 0 && (
                            <div className="mb-12">
                                <h2 className="font-ancient text-2xl text-[#3d2b1f] mb-6 border-b border-manthan-maroon/10 pb-4">Laws of the Realm</h2>
                                <ul className="space-y-4">
                                    {event.rules.map((rule, index) => (
                                        <li key={index} className="flex items-start text-[#5c4033] font-serif italic text-lg">
                                            <span className="w-2 h-2 rounded-full bg-manthan-maroon/30 mr-4 mt-2.5 flex-shrink-0" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Register CTA */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 border-t border-manthan-maroon/10">
                            <Link href={`/register?event=${event.id}`} className="scale-110">
                                <AnimatedButton icon="sparkles">
                                    Register Inscriptions
                                </AnimatedButton>
                            </Link>
                            <Link
                                href="/events"
                                className="px-10 py-4 font-ancient text-manthan-maroon uppercase tracking-widest hover:text-black transition-colors"
                            >
                                Back to All Realms
                            </Link>
                        </div>
                    </ScrollWrapper>
                </div>
            </main>
            <Footer />
        </>
    );
}
