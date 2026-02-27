import { Event } from '@/lib/types';
import { formatFee, formatDateTime, categoryColors, categoryIcons } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, IndianRupee } from 'lucide-react';
import { notFound } from 'next/navigation';

import { getEventBySlug } from '@/lib/events-catalog';

async function getEvent(slug: string): Promise<Event | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/events`, { cache: 'no-store' });
        const data = await res.json();
        const events = data.events || [];
        const event = events.find((e: Event) => e.slug === slug);
        return event || getEventBySlug(slug) || null;
    } catch {
        return getEventBySlug(slug) || null;
    }
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
            <main className="pt-24 pb-16 px-4 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/events"
                        className="inline-flex items-center text-gray-400 hover:text-manthan-gold transition-colors mb-8"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Events
                    </Link>

                    {/* Event Card */}
                    <div className="glass-card p-8 md:p-12">
                        {/* Category Badge */}
                        <span className={`inline-block px-4 py-1.5 text-sm font-medium rounded-full mb-6 ${colors.badge}`}>
                            {categoryIcons[event.category]} {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                        </span>

                        {/* Title */}
                        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
                            {event.name}
                        </h1>

                        {/* Description */}
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">{event.description}</p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center space-x-3 p-4 rounded-lg bg-manthan-black/50 border border-manthan-gold/10">
                                <Calendar size={20} className="text-manthan-gold" />
                                <div>
                                    <p className="text-xs text-gray-500">Date & Time</p>
                                    <p className="text-gray-200 text-sm">{formatDateTime(event.event_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 rounded-lg bg-manthan-black/50 border border-manthan-gold/10">
                                <MapPin size={20} className="text-manthan-gold" />
                                <div>
                                    <p className="text-xs text-gray-500">Venue</p>
                                    <p className="text-gray-200 text-sm">{event.venue}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 rounded-lg bg-manthan-black/50 border border-manthan-gold/10">
                                <Users size={20} className="text-manthan-gold" />
                                <div>
                                    <p className="text-xs text-gray-500">Team Size</p>
                                    <p className="text-gray-200 text-sm">{teamInfo}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 rounded-lg bg-manthan-black/50 border border-manthan-gold/10">
                                <IndianRupee size={20} className="text-manthan-gold" />
                                <div>
                                    <p className="text-xs text-gray-500">Registration Fee</p>
                                    <p className="text-gray-200 text-sm font-bold">{formatFee(event.fee)}</p>
                                    {event.fee_calculation && (
                                        <p className="text-gray-500 text-xs">
                                            {event.fee_calculation === 'per_participant' ? 'Per participant' : 'Per team'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(event.prize_text || event.prize_winner || event.prize_runner_up || event.prize_second_runner_up || event.registration_deadline) && (
                            <div className="mb-8 rounded-lg border border-manthan-gold/10 bg-manthan-black/40 p-5">
                                <h2 className="font-heading text-xl font-bold text-manthan-gold mb-3">Prizes & Deadlines</h2>
                                {event.prize_text && <p className="text-gray-300 text-sm mb-3">{event.prize_text}</p>}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                                    {event.prize_winner && (
                                        <div>
                                            <p className="text-gray-500 text-xs">Winner</p>
                                            <p className="text-manthan-gold font-semibold">{formatFee(event.prize_winner)}</p>
                                        </div>
                                    )}
                                    {event.prize_runner_up && (
                                        <div>
                                            <p className="text-gray-500 text-xs">Runner-up</p>
                                            <p className="text-manthan-gold font-semibold">{formatFee(event.prize_runner_up)}</p>
                                        </div>
                                    )}
                                    {event.prize_second_runner_up && (
                                        <div>
                                            <p className="text-gray-500 text-xs">Second Runner-up</p>
                                            <p className="text-manthan-gold font-semibold">{formatFee(event.prize_second_runner_up)}</p>
                                        </div>
                                    )}
                                </div>
                                {event.registration_deadline && (
                                    <p className="text-gray-400 text-xs">
                                        Registration closes: {formatDateTime(event.registration_deadline)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Spots Left */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Spots Remaining</span>
                                <span className={`text-sm font-bold ${spotsLeft < 20 ? 'text-manthan-crimson' : 'text-manthan-gold'}`}>
                                    {spotsLeft} / {event.max_participants}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-manthan-black/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-manthan-gold to-manthan-crimson rounded-full transition-all"
                                    style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Rules */}
                        {event.rules && event.rules.length > 0 && (
                            <div className="mb-8">
                                <h2 className="font-heading text-xl font-bold text-manthan-gold mb-4">Rules & Guidelines</h2>
                                <ul className="space-y-2">
                                    {event.rules.map((rule, index) => (
                                        <li key={index} className="flex items-start text-gray-300 text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-manthan-gold/50 mr-3 mt-2 flex-shrink-0" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Register CTA */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={`/register?event=${event.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-bold rounded-lg text-center text-lg hover:from-manthan-crimson hover:to-manthan-maroon transition-all duration-300 shadow-xl shadow-manthan-maroon/30"
                            >
                                Register for {event.name}
                            </Link>
                            <Link
                                href="/events"
                                className="px-8 py-4 border border-manthan-gold/30 text-manthan-gold font-semibold rounded-lg text-center hover:bg-manthan-gold/10 transition-all duration-300"
                            >
                                Browse All Events
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
