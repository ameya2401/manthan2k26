'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, ChevronDown } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const FAQS = [
    {
        keywords: ['manthan', 'what', 'fest', 'about'],
        answer: "Manthan 2026 is our college's premier Technical and Cultural extravaganza. It's a platform where 'Roots meet Realms', showcasing the best of innovation, creativity, and talent across multiple domains."
    },
    {
        keywords: ['event', 'list', 'technical', 'cultural', 'sports'],
        answer: "We have events across three categories: Technical (Prompt2Website: The Vibe Coding Challenge, TypeSprint: The Ultimate Typing Showdown, QuizStorm: Battle of Brains, CanvaCraft: The Poster Design Challenge), Cultural (NrityaVerse, SurTarang), and Sports (Cricket, Volleyball, Indoor games). You can explore them all on our 'Events' page!"
    },
    {
        keywords: ['register', 'how', 'sign up', 'apply'],
        answer: "Registration is easy! Click the 'Register Now' button on the Navbar or any Event Detail page. It will open in a new tab and guide you through the process."
    },
    {
        keywords: ['fee', 'payment', 'cost', 'amount', 'price'],
        answer: "Each event has a specific fee, either per participant or per team. You can see exact amounts during selection. Payments are processed securely via Razorpay."
    },
    {
        keywords: ['venue', 'location', 'where', 'address', 'bvimit'],
        answer: "Manthan 2026 is hosted at BVIMIT (Bharati Vidyapeeth's Institute of Management and Information Technology), Sector-8, Belapur, CBD, Navi Mumbai."
    },
    {
        keywords: ['date', 'when', 'schedule', 'time'],
        answer: "Manthan 2026 is scheduled for March 15th and 16th, 2026. Keep an eye on the website for the detailed hour-by-hour schedule coming soon!"
    },
    {
        keywords: ['contact', 'help', 'support', 'email', 'number'],
        answer: "You can reach us at manthan@bvimit.co.in or call +91 123 456 7890. Visit our 'Contact' page for more details."
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
            timestamp: new Date()
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Process Bot Response
        setTimeout(() => {
            const query = input.toLowerCase();
            let responseText = "Sorry, I can only help with Manthan Fest related queries. Please ask about events, registration, fees, venue, or schedule.";

            for (const faq of FAQS) {
                if (faq.keywords.some(keyword => query.includes(keyword))) {
                    responseText = faq.answer;
                    break;
                }
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[320px] sm:w-[380px] h-[500px] bg-[#0a0a0a] border border-manthan-gold/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-manthan-maroon to-manthan-dark border-b border-manthan-gold/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-manthan-gold/10 border border-manthan-gold/30 flex items-center justify-center">
                                    <Bot size={18} className="text-manthan-gold" />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-bold tracking-wide uppercase">Manthan AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-gray-400">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 mt-1 ${msg.sender === 'user' ? 'bg-manthan-gold/10' : 'bg-manthan-maroon/20'
                                            }`}>
                                            {msg.sender === 'user' ? <User size={14} className="text-manthan-gold" /> : <Bot size={14} className="text-manthan-maroon" />}
                                        </div>
                                        <div className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-manthan-gold/10 text-gray-200 rounded-tr-none'
                                            : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-manthan-black">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about events, registration..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-manthan-gold/30 transition-all font-body"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="absolute right-1.5 p-2 text-manthan-gold hover:text-manthan-gold-light disabled:opacity-30 disabled:hover:text-manthan-gold transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-manthan-maroon to-manthan-crimson border border-manthan-gold/30 shadow-2xl flex items-center justify-center text-manthan-gold group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-manthan-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <ChevronDown size={28} /> : <MessageSquare size={26} />}
            </motion.button>
        </div>
    );
}
