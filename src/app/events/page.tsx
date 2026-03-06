import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventsFilter from './EventsFilter';

import { getActiveEvents } from '@/lib/events-catalog';

export const metadata = {
    title: 'Events | Manthan 2026',
    description: 'Explore all events at Manthan 2026 tech fest',
};

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    // Fetch events server-side via internal API to avoid build-time Supabase client
    let events = [];
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/events`, { cache: 'no-store' });
        const data = await res.json();
        events = data.events || [];
    } catch {
        events = [];
    }

    // Fallback to local catalog if API returns empty
    if (events.length === 0) {
        events = getActiveEvents();
    }

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="font-ancient text-5xl md:text-7xl royal-header mb-6">
                            The Chronicles
                        </h1>
                        <p className="font-serif italic text-manthan-gold/60 text-xl max-w-2xl mx-auto">
                            Step into the arena where legends are forged and history is written.
                            Explore our technical, cultural, and sports realms.
                        </p>
                    </div>

                    <EventsFilter events={events} />
                </div>
            </main>
            <Footer />
        </>
    );
}
