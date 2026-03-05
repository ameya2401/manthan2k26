'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollWrapper from '@/components/ScrollWrapper';

const teamMembers = [
    {
        name: 'Riya Thakur',
        role: 'Lead Developer',
        image: '/profile/riya-thakur.png',
        description: 'Master of the digital realm, weaving complex architectures with the finesse of an ancient scribe.'
    },
    {
        name: 'Ameya Bhagat',
        role: 'UI/UX Designer',
        image: '/profile/ameya-bhagat.png',
        description: 'Bringing the ancient aesthetics to the modern web through gold-leafed pixels and royal layouts.'
    },
    {
        name: 'Aryan Lehgaonkar',
        role: 'Frontend Expert',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop',
        description: 'Crafting scrolls of code that breathe life into the static, creating interactive legends.'
    },
    {
        name: 'Uday Bhoi',
        role: 'Backend Specialist',
        image: '/profile/uday-bhoi.png',
        description: 'Transmuting raw data into gold through robust systems and secure digital vaults.'
    }
];

export default function WorkforcePage() {
    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h1 className="font-heading text-5xl md:text-7xl font-bold text-gold-gradient mb-4 uppercase tracking-tighter">
                            Workforce
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-manthan-gold to-transparent mx-auto mb-6"></div>
                        <p className="font-body text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto italic">
                            Web Development Team Manthan
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <ScrollWrapper
                                key={index}
                                padding="p-0"
                                className="group transition-all duration-500"
                            >
                                <div className="aspect-square overflow-hidden relative">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3d2b1f] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                </div>

                                <div className="p-6 relative z-10 -mt-12">
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-lg border-t border-manthan-gold/20 transform group-hover:-translate-y-2 transition-transform duration-500 shadow-lg">
                                        <h3 className="font-ancient text-xl font-bold text-[#3d2b1f] mb-1 uppercase tracking-wider">
                                            {member.name}
                                        </h3>
                                        <p className="text-manthan-maroon text-sm font-bold tracking-widest uppercase mb-3">
                                            {member.role}
                                        </p>
                                        <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                            <p className="text-[#5c4033] text-sm leading-relaxed border-t border-manthan-gold/10 pt-3 italic">
                                                {member.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollWrapper>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
