'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    options?: string[];
}

const FAQS = [
    {
        keywords: ['manthan', 'what', 'fest', 'about', 'meaning'],
        answer: "Manthan 2026 is BVIMIT’s premier Intercollegiate Technical, Cultural, and Sports festival. Inspired by 'Samudra Manthan', it symbolizes the churning of ideas to bring forth excellence. Our theme, 'Roots meet Realms', celebrates our heritage while embracing the future.",
        options: ['Technical Events', 'Cultural Events', 'Sports Events', 'Schedule']
    },
    {
        keywords: ['explore events', 'view events', 'event categories', 'events'],
        answer: "We have a thrilling lineup for 2026:\n• TECHNICAL: VantraSutra (AI Website Building), Akshar Vedha (Typing), Gyansabha (Quiz), Rachnatmak Kala (Canva)\n• CULTURAL: Ekal / Samuha Nritya (Dance), Swara Ekam / Sangam (Singing)\n• SPORTS: Kanduk Kshetra (Cricket), Vayu Kanduk (Volleyball), Vayu Krida (Badminton), Digital Yuddh (BGMI), Fitness & Board Games",
        options: ['Technical Events', 'Cultural Events', 'Sports Events', 'Schedule']
    },
    {
        keywords: ['technical events', 'technical'],
        answer: "Sharpen your intellect at our Tech Arena:\n• VantraSutra: AI Website Building challenge\n• Akshar Vedha: The Ultimate Typing Showdown\n• Gyansabha: Battle of Brains\n• Rachnatmak Kala: Poster Design challenge",
        options: ['VantraSutra (AI Website Building)', 'Akshar Vedha (Typing Competition)', 'Gyansabha (Quiz Competition)', 'Registration']
    },
    {
        keywords: ['cultural events', 'cultural'],
        answer: "Experience the magic of performance:\n• Ekal / Samuha Nritya: Dance competition (Solo/Group)\n• Swara Sangam / Ekam: Singing competition (Solo/Group)\nHeld on the Main Stage and Seminar Hall.",
        options: ['Ekal / Samuha Nritya (Dance)', 'Swara Ekam / Sangam (Singing)', 'Registration']
    },
    {
        keywords: ['sports events', 'sports', 'games'],
        answer: "Fuel your competitive spirit:\n• Outdoor: Kanduk Kshetra (Box Cricket), Vayu Kanduk (Volleyball), Vayu Krida (Badminton), Rassa Yuddh (Tug of War)\n• Indoor: Chaturang (Chess), Chakra Sangram (Carrom), Chatur Yatra (Ludo)\n• Fitness: Bhu Utthaan (Deadlift), Bahu Bal (Bench Press)\n• E-Sports: Digital Yuddh (BGMI) Squad Battle",
        options: ['Kanduk Kshetra (Box Cricket)', 'Digital Yuddh (BGMI)', 'Vayu Krida (Badminton)', 'Registration']
    },
    {
        keywords: ['registration', 'register', 'how to register', 'sign up'],
        answer: "Registration is simple!\n1. Explore the 'Events' section.\n2. Click 'Register Inscriptions'.\n3. Fill in your details and complete the secure payment.\nEnsure you have your College ID ready!",
        options: ['Go to Registration', 'Main Menu']
    },
    {
        keywords: ['fee', 'payment', 'cost', 'price'],
        answer: "Fees vary by event:\n• Technical: ₹40 - ₹50\n• Cultural: ₹200 (Solo) / ₹400 (Group)\n• Sports: Vary by team size (e.g., Cricket ₹950/team)\nCheck the specific event details on the registration portal.",
        options: ['Registration', 'Contact Support']
    },
    {
        keywords: ['venue', 'location', 'address', 'where'],
        answer: "Manthan 2026 takes place at BVIMIT, Plot No. 3, Sector 7, Belapur, Navi Mumbai. Located right across from the Belapur Railway Station.\nSpecific arenas include the Main Stage, E-Sports Arena, and Fitness Hall.",
        options: ['Get Directions', 'Main Menu']
    },
    {
        keywords: ['schedule', 'time', 'date', 'dates', 'when'],
        answer: "The Chronicles of Manthan unfold over two days:\n• Day 1 (March 24th): Technical & Sports Prelims\n• Day 2 (March 25th): Cultural Main Stage & Grand Finale\nEvents generally run from 9:00 AM to 5:00 PM.",
        options: ['Full Schedule', 'View Events']
    },
    {
        keywords: ['contact', 'help', 'support', 'organizers', 'coordinator'],
        answer: "Need help from the scribes? \n• Phone: 022-27578415\n• Email: principal.bvimit@bharatividyapeeth.edu\n• Location: Desk 1, BVIMIT Main Building",
        options: ['Call Now', 'Email Now', 'Main Menu']
    },
    {
        keywords: ['main menu', 'hi', 'hello', 'hey', 'start', 'help'],
        answer: "Greetings, seeker! I am the Manthan Oracle. How shall I assist you in your journey through the realms today?",
        options: ['About Manthan', 'Explore Events', 'Registration', 'Venue & Schedule']
    }
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm the Manthan Assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
            options: ['About Manthan', 'Explore Events', 'Registration', 'Contact Us']
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Process Bot Response
        setTimeout(() => {
            const query = messageText.toLowerCase();
            let responseText = "Greetings Seeker! My wisdom is limited to the realms of Manthan. Perhaps you wish to ask about our events, registration processes, the sacred schedule, or our sanctuary's location?";
            let options: string[] | undefined = ['About Manthan', 'Explore Events', 'Venue & Schedule'];

            for (const faq of FAQS) {
                if (faq.keywords.some(keyword => query.includes(keyword))) {
                    responseText = faq.answer;
                    options = faq.options;
                    break;
                }
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date(),
                options: options
            };

            setMessages(prev => [...prev, botMessage]);
        }, 600);
    };

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[1001] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, originY: 'bottom', originX: 'right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full h-[100dvh] sm:h-[600px] sm:w-[400px] shadow-2xl flex flex-col overflow-hidden relative sm:rounded-2xl parchment-theme sm:mb-4"
                        style={{ perspective: '1000px' }}
                    >
                        {/* Ancient Header */}
                        <div className="p-4 bg-[#3d2b1f] border-b-2 border-manthan-gold flex items-center justify-between relative z-20">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 shrink-0">
                                    <Image
                                        src="/bbbg-removebg-preview.png"
                                        alt="Manthan Logo"
                                        fill
                                        className="object-contain drop-shadow-[0_0_8px_rgba(212,168,55,0.4)]"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-manthan-gold text-sm font-ancient font-bold tracking-[0.15em] uppercase">The Scribe</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-manthan-gold animate-pulse shadow-[0_0_8px_rgba(212,168,55,0.8)]" />
                                        <span className="text-[10px] text-manthan-gold/60 font-serif italic uppercase tracking-wider">Present</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-manthan-gold/50 hover:text-manthan-gold transition-colors p-2 hover:bg-white/5 rounded-full"
                            >
                                <X size={26} />
                            </button>
                        </div>

                        {/* Parchment Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative bg-[#f4e4bc] text-[#3d2b1f] font-serif shadow-inner">
                            {/* Ink Stains/Texture effect */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] mix-blend-multiply" />

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                >
                                    <div className={`flex flex-col gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-sm rotate-3 flex items-center justify-center shrink-0 mt-1 shadow-md ${msg.sender === 'user' ? 'bg-[#3d2b1f]' : 'bg-manthan-maroon'
                                                }`}>
                                                {msg.sender === 'user' ? <User size={16} className="text-manthan-gold" /> : <Bot size={16} className="text-manthan-gold" />}
                                            </div>
                                            <div className={`p-4 rounded-lg text-sm leading-relaxed relative ${msg.sender === 'user'
                                                ? 'bg-[#3d2b1f] text-manthan-gold shadow-lg rounded-tr-none -rotate-1'
                                                : 'bg-[#ede0c8] text-[#2c1e0f] shadow-md rounded-tl-none border-l-4 border-manthan-maroon/20 rotate-1'
                                                }`}>
                                                <div className="relative z-10 font-medium">
                                                    {msg.text}
                                                </div>
                                                {/* Wax Seal effect for bot */}
                                                {msg.sender === 'bot' && (
                                                    <div className="absolute -bottom-2 -right-2 opacity-20 transform -rotate-12 pointer-events-none">
                                                        <Sparkles size={24} className="text-manthan-maroon" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ancient Response Options */}
                                        {msg.sender === 'bot' && msg.options && (
                                            <div className="flex flex-wrap gap-2.5 mt-2 ml-11">
                                                {msg.options.map((option) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => handleSend(option)}
                                                        className="px-4 py-2 rounded-md bg-[#3d2b1f]/5 border border-[#3d2b1f]/20 text-[11px] font-ancient font-bold text-[#3d2b1f] hover:bg-manthan-maroon hover:text-manthan-gold hover:border-manthan-maroon transition-all duration-500 shadow-sm uppercase tracking-widest"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area (Inkwell Style) */}
                        <div className="p-5 bg-[#3d2b1f] border-t-2 border-manthan-gold relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-manthan-gold to-transparent" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Scribe your query here..."
                                        className="w-full bg-[#f4e4bc]/10 border border-manthan-gold/30 rounded-lg py-3 pl-4 pr-12 text-sm text-manthan-gold placeholder:text-manthan-gold/30 focus:outline-none focus:border-manthan-gold/60 focus:bg-[#f4e4bc]/20 transition-all font-serif"
                                    />
                                    <div className="absolute bottom-1 right-12 w-8 h-[2px] bg-manthan-gold/20 scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                                </div>
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="p-3 bg-manthan-gold text-[#3d2b1f] rounded-lg hover:bg-manthan-gold-light disabled:opacity-20 disabled:grayscale transition-all shadow-[0_4px_10px_rgba(212,168,55,0.3)] active:scale-95"
                                >
                                    <Send size={20} className="transform -rotate-12" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#3d2b1f] to-manthan-maroon border-2 border-manthan-gold/50 shadow-[0_0_25px_rgba(212,168,55,0.3)] flex items-center justify-center text-manthan-gold group overflow-hidden relative mr-6 mb-6 sm:mr-0 sm:mb-0"
                    >
                        <div className="absolute inset-0 bg-manthan-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MessageSquare size={28} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-manthan-gold rounded-full border-2 border-[#3d2b1f]"
                        />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
