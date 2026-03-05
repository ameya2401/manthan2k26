import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-manthan-black border-t border-manthan-gold/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Socials */}
                    <div className="space-y-6 text-center md:text-left">
                        <div>
                            <h3 className="font-heading text-3xl font-black text-gold-gradient tracking-tighter mb-2">
                                MANTHAN 2026
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                                Where innovation meets creativity. Join us for the most awaited technical and cultural extravaganza of the year.
                            </p>
                        </div>

                        <div className="flex items-center justify-center md:justify-start space-x-4">
                            {[
                                { icon: Instagram, href: 'https://instagram.com/manthan', color: 'hover:text-pink-500' },
                                { icon: Youtube, href: 'https://youtube.com/manthan', color: 'hover:text-red-500' },
                                { icon: Facebook, href: 'https://facebook.com/manthan', color: 'hover:text-blue-500' },
                                { icon: Linkedin, href: 'https://linkedin.com/manthan', color: 'hover:text-blue-400' },
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${social.color} hover:bg-white/10 scale-100 hover:scale-110`}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="text-manthan-gold font-bold uppercase tracking-widest text-sm mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {[
                                { href: '/events', label: 'Events' },
                                { href: '/workforce', label: 'Workforce' },
                                { href: '/sponsorship', label: 'Sponsorship' },
                                { href: '/about', label: 'About Us' },
                                { href: '/contact', label: 'Contact Us' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-manthan-gold text-sm transition-colors duration-300 flex items-center justify-center md:justify-start group"
                                    >
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-manthan-gold mr-0 group-hover:mr-2 transition-all duration-300" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left">
                        <h4 className="text-manthan-gold font-bold uppercase tracking-widest text-sm mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start justify-center md:justify-start space-x-3">
                                <MapPin size={20} className="text-manthan-gold shrink-0" />
                                <span>Bharati Vidyapeeth&apos;s Institute of Management and Information Technology (BVIMIT), Sector-8, Belapur, CBD, Navi Mumbai - 400614</span>
                            </li>
                            <li className="flex items-center justify-center md:justify-start space-x-3">
                                <Phone size={18} className="text-manthan-gold shrink-0" />
                                <div className="flex flex-col md:flex-row md:space-x-2">
                                    <a href="tel:02227578415" className="hover:text-manthan-gold transition-colors duration-300">022-27578415</a>
                                    <span className="hidden md:inline">,</span>
                                    <a href="tel:+918657008016" className="hover:text-manthan-gold transition-colors duration-300">+91 8657008016</a>
                                </div>
                            </li>
                            <li className="flex items-center justify-center md:justify-start space-x-3">
                                <Globe size={18} className="text-manthan-gold shrink-0" />
                                <a href="https://www.bvimit.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-manthan-gold transition-colors duration-300">www.bvimit.co.in</a>
                            </li>
                            <li className="flex items-center justify-center md:justify-start space-x-3">
                                <Mail size={18} className="text-manthan-gold shrink-0" />
                                <a href="mailto:principal.bvimit@bharatividyapeeth.edu" className="hover:text-manthan-gold transition-colors duration-300">principal.bvimit@bharatividyapeeth.edu</a>
                            </li>
                        </ul>
                    </div>

                    {/* Location Map */}
                    <div className="h-48 lg:h-full min-h-[200px] rounded-2xl overflow-hidden border border-manthan-gold/20 shadow-lg shadow-manthan-gold/5 group">
                        <iframe
                            src="https://www.google.com/maps?q=Bharati%20Vidyapeeth%E2%80%99s%20Institute%20of%20Management%20%26%20Info%20Tech%20(MCA)%20Master%20of%20Computer%20Application%20under%20University%20of%20Mumbai&z=17&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                        />
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 text-center">
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-2">
                        Designed & Developed by BVIMIT Web Team
                    </p>
                    <p className="text-gray-600 text-[10px]">
                        © 2026 Manthan Fest. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
