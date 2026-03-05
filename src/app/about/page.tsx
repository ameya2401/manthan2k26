'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollWrapper from '@/components/ScrollWrapper';
import { motion } from 'framer-motion';
import { History, Target, Sparkles, Trophy, Rocket } from 'lucide-react';

export default function AboutPage() {
    return (
        <>
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:pt-32 relative min-h-screen">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-manthan-gold font-tagline text-xl uppercase tracking-[0.4em] mb-4 block"
                        >
                            Roots to Realms
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-ancient text-4xl md:text-6xl font-bold text-gold-gradient mb-6"
                        >
                            The Story of Manthan
                        </motion.h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                        <ScrollWrapper padding="p-10">
                            <div className="w-12 h-12 rounded-xl bg-manthan-maroon/10 flex items-center justify-center mb-6">
                                <History className="text-manthan-maroon" size={24} />
                            </div>
                            <h2 className="font-ancient text-2xl font-bold text-[#3d2b1f] mb-4 uppercase">Our Legacy</h2>
                            <p className="text-[#5c4033] text-sm leading-relaxed mb-4">
                                Over the years, MANTHAN has evolved into one of Navi Mumbai’s prominent intercollegiate festivals, reflecting the dedication and collaborative spirit of BVIMIT’s faculty and students. The fest has consistently attracted participation from colleges across Thane District and Navi Mumbai, witnessing large-scale engagement, including over 700 participants in 2024. Editions such as MANTHAN 2022, 2024, and 2025 have successfully featured a wide array of events, including IT and gaming competitions, academic contests, sports tournaments, and cultural showcases judged by distinguished guests and industry experts. The seamless organization, active involvement of faculty coordinators, generous support from sponsors, and the presence of eminent chief guests have contributed to its continued success. Each year, MANTHAN leaves a lasting impact by promoting academic excellence, creativity, sportsmanship, and leadership, thereby strengthening its reputation as a flagship fest of the institute.
                            </p>
                        </ScrollWrapper>

                        <ScrollWrapper padding="p-10">
                            <div className="w-12 h-12 rounded-xl bg-manthan-maroon/10 flex items-center justify-center mb-6">
                                <Target className="text-manthan-maroon" size={24} />
                            </div>
                            <h2 className="font-ancient text-2xl font-bold text-[#3d2b1f] mb-4 uppercase">The Vision</h2>
                            <p className="text-[#5c4033] text-sm leading-relaxed mb-4">
                                Bharati Vidyapeeth Institute of Management and Information Technology (BVIMIT), Navi Mumbai, envisions *MANTHAN* as a dynamic intercollegiate platform that nurtures innovation, creativity, leadership, and collaborative learning among students. Inspired by the concept of *Samudra Manthan*, symbolizing the churning of ideas to bring forth excellence, the fest aims to provide an academically and culturally enriching environment. Through a diverse blend of IT competitions, academic challenges, indoor and outdoor sports, and cultural performances, MANTHAN encourages students to explore their talents, exchange knowledge, and develop teamwork and organizational skills. The institute remains committed to fostering originality and individuality by offering equal opportunities to all participants and motivating them to think innovatively and implement their ideas through this vibrant collegiate festival.
                            </p>
                        </ScrollWrapper>
                    </div>

                    <div className="mb-24">
                        <h2 className="font-ancient text-3xl font-bold text-center text-gold-gradient mb-12 uppercase tracking-widest">Journey Through Time</h2>
                        <div className="space-y-8">
                            {[
                                {
                                    year: '2023',
                                    title: 'The Inception',
                                    desc: 'Manthan was launched as a humble initiative by BVIMIT to bridge the gap between classroom learning and practical application.',
                                    icon: Rocket
                                },
                                {
                                    year: '2024',
                                    title: 'Expanding Horizons',
                                    desc: 'Introduced regional level competitions and established the three pillars: Technical, Cultural, and Sports.',
                                    icon: Sparkles
                                },
                                {
                                    year: '2025',
                                    title: 'A New Standard',
                                    desc: 'Reached record-breaking engagement with over 20+ events and the first-ever e-sports arena integration.',
                                    icon: Trophy
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.year}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative pl-12 md:pl-0"
                                >
                                    <div className="md:grid md:grid-cols-12 md:gap-8 items-center">
                                        <div className="hidden md:block md:col-span-2 text-right">
                                            <span className="font-ancient text-3xl font-bold text-manthan-gold/40">{item.year}</span>
                                        </div>
                                        <div className="hidden md:flex md:col-span-1 justify-center relative">
                                            <div className="w-px h-full bg-manthan-gold/20 absolute top-0 bottom-0" />
                                            <div className="w-4 h-4 rounded-full bg-manthan-gold relative z-10 my-auto" />
                                        </div>
                                        <div className="md:col-span-9 bg-manthan-gold/5 border border-manthan-gold/10 p-6 rounded-2xl group hover:border-manthan-gold/30 transition-all">
                                            <div className="flex items-center gap-4 mb-2">
                                                <item.icon size={20} className="text-manthan-gold" />
                                                <h3 className="font-ancient text-xl font-bold text-manthan-gold">{item.title}</h3>
                                                <span className="md:hidden text-manthan-gold/40 font-bold ml-auto">{item.year}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm italic">{item.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
