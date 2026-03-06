'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Event } from '@/lib/types';
import EventCard from '@/components/EventCard';
import { getSportsTrackByName } from '@/lib/constants';

const categories = ['all', 'technical', 'cultural', 'sports'];

export default function EventsFilter({ events }: { events: Event[] }) {
    const [activeCategory, setActiveCategory] = useState('all');

    const filtered =
        activeCategory === 'all'
            ? events
            : events.filter((e) => e.category === activeCategory);

    const sportsEvents = filtered.filter((e) => e.category === 'sports');
    const outdoorSports = sportsEvents.filter((event) => getSportsTrackByName(event.name) === 'outdoor');
    const indoorSports = sportsEvents.filter((event) => getSportsTrackByName(event.name) === 'indoor');
    const otherSports = sportsEvents.filter((event) => !getSportsTrackByName(event.name));

    return (
        <>
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`font-ancient px-8 py-3 transition-all duration-300 uppercase tracking-widest text-sm rounded-full border-2 ${activeCategory === cat
                            ? 'bg-manthan-gold text-manthan-black border-manthan-gold shadow-[0_0_20px_rgba(212,168,55,0.4)] scale-105'
                            : 'bg-transparent text-manthan-gold border-manthan-gold/30 hover:border-manthan-gold/60 hover:bg-manthan-gold/5'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            {activeCategory === 'sports' ? (
                <div className="space-y-10">
                    {outdoorSports.length > 0 && (
                        <motion.div
                            initial="closed"
                            whileInView="open"
                            viewport={{ once: true }}
                            className="parchment-container rounded-none mb-12"
                        >
                            <motion.div variants={{ closed: { y: 10 }, open: { y: 0 } }} className="scroll-roll" />
                            <motion.div
                                variants={{ closed: { height: 0, opacity: 0 }, open: { height: 'auto', opacity: 1 } }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="parchment-body p-8 overflow-hidden"
                            >
                                <h2 className="font-ancient text-2xl uppercase tracking-[0.2em] text-[#3d2b1f] mb-8 border-b border-[#3d2b1f]/20 pb-4">
                                    Outdoor Sports
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 event-sub-container p-8">
                                    {outdoorSports.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={{ closed: { y: -10 }, open: { y: 0 } }} className="scroll-roll" />
                        </motion.div>
                    )}

                    {indoorSports.length > 0 && (
                        <motion.div
                            initial="closed"
                            whileInView="open"
                            viewport={{ once: true }}
                            className="parchment-container rounded-none mb-12"
                        >
                            <motion.div variants={{ closed: { y: 10 }, open: { y: 0 } }} className="scroll-roll" />
                            <motion.div
                                variants={{ closed: { height: 0, opacity: 0 }, open: { height: 'auto', opacity: 1 } }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="parchment-body p-8 overflow-hidden"
                            >
                                <h2 className="font-ancient text-2xl uppercase tracking-[0.2em] text-[#3d2b1f] mb-8 border-b border-[#3d2b1f]/20 pb-4">
                                    Indoor Sports
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 event-sub-container p-8">
                                    {indoorSports.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={{ closed: { y: -10 }, open: { y: 0 } }} className="scroll-roll" />
                        </motion.div>
                    )}

                    {otherSports.length > 0 && (
                        <motion.div
                            initial="closed"
                            whileInView="open"
                            viewport={{ once: true }}
                            className="parchment-container rounded-none mb-12"
                        >
                            <motion.div variants={{ closed: { y: 10 }, open: { y: 0 } }} className="scroll-roll" />
                            <motion.div
                                variants={{ closed: { height: 0, opacity: 0 }, open: { height: 'auto', opacity: 1 } }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="parchment-body p-8 overflow-hidden"
                            >
                                <h2 className="font-ancient text-2xl uppercase tracking-[0.2em] text-[#3d2b1f] mb-8 border-b border-[#3d2b1f]/20 pb-4">
                                    More Sports Events
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 event-sub-container p-8">
                                    {otherSports.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={{ closed: { y: -10 }, open: { y: 0 } }} className="scroll-roll" />
                        </motion.div>
                    )}
                </div>
            ) : (
                <motion.div
                    key={activeCategory}
                    initial="closed"
                    animate="open"
                    className="parchment-container rounded-none"
                >
                    <motion.div variants={{ closed: { y: 10 }, open: { y: 0 } }} className="scroll-roll" />
                    <motion.div
                        variants={{ closed: { height: 0, opacity: 0 }, open: { height: 'auto', opacity: 1 } }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="parchment-body p-8"
                    >
                        {activeCategory !== 'all' && (
                            <h2 className="font-ancient text-3xl uppercase tracking-[0.2em] text-[#3d2b1f] mb-10 border-b-2 border-[#3d2b1f]/10 pb-6 text-center">
                                {activeCategory} Realms
                            </h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </motion.div>
                    <motion.div variants={{ closed: { y: -10 }, open: { y: 0 } }} className="scroll-roll" />
                </motion.div>
            )}

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No events found in this category.</p>
                </div>
            )}
        </>
    );
}
