'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to an API endpoint
        setSubmitted(true);
    };

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
                            Contact Us
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Have questions about Manthan 2026? Reach out to us and we&apos;ll get back to you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="glass-card p-8">
                                <h2 className="font-heading text-2xl font-bold text-manthan-gold mb-6">
                                    Get in Touch
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-manthan-maroon/20 flex items-center justify-center flex-shrink-0">
                                            <Mail size={20} className="text-manthan-gold" />
                                        </div>
                                        <div>
                                            <h3 className="text-manthan-gold font-medium">Email</h3>
                                            <p className="text-gray-400 text-sm">principal.bvimit@bharatividyapeeth.edu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-manthan-maroon/20 flex items-center justify-center flex-shrink-0">
                                            <Phone size={20} className="text-manthan-gold" />
                                        </div>
                                        <div>
                                            <h3 className="text-manthan-gold font-medium">Phone</h3>
                                            <p className="text-gray-400 text-sm">022-27578415</p>
                                            <p className="text-gray-400 text-sm">+91 8657008016</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-manthan-maroon/20 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={20} className="text-manthan-gold" />
                                        </div>
                                        <div>
                                            <h3 className="text-manthan-gold font-medium">Address</h3>
                                            <p className="text-gray-400 text-sm">
                                                Bharati Vidyapeeth&apos;s Institute of Management and Information Technology (BVIMIT),<br />
                                                Sector-8, Belapur, CBD, Navi Mumbai - 400614
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="glass-card p-8">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <MessageSquare size={48} className="mx-auto text-manthan-gold mb-4" />
                                    <h3 className="font-heading text-2xl font-bold text-manthan-gold mb-2">
                                        Message Sent!
                                    </h3>
                                    <p className="text-gray-400">
                                        We&apos;ll get back to you as soon as possible.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-heading text-2xl font-bold text-manthan-gold mb-6">
                                        Send a Message
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Your Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-manthan-black/50 border border-manthan-gold/20 text-gray-200 text-sm focus:border-manthan-gold/50 focus:outline-none focus:ring-1 focus:ring-manthan-gold/30 transition-colors"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-manthan-black/50 border border-manthan-gold/20 text-gray-200 text-sm focus:border-manthan-gold/50 focus:outline-none focus:ring-1 focus:ring-manthan-gold/30 transition-colors"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-manthan-black/50 border border-manthan-gold/20 text-gray-200 text-sm focus:border-manthan-gold/50 focus:outline-none focus:ring-1 focus:ring-manthan-gold/30 transition-colors"
                                                placeholder="Subject"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-manthan-black/50 border border-manthan-gold/20 text-gray-200 text-sm focus:border-manthan-gold/50 focus:outline-none focus:ring-1 focus:ring-manthan-gold/30 transition-colors resize-none"
                                                placeholder="Your message..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-semibold rounded-lg hover:from-manthan-crimson hover:to-manthan-maroon transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <Send size={18} />
                                            Send Message
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
