'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScrollWrapper from '@/components/ScrollWrapper';
import AnimatedButton from '@/components/AnimatedButton';
import { Event, RegistrationFormData, TeamMember, TeamRegistration } from '@/lib/types';
import {
    formatFee,
    categoryColors,
    categoryIcons,
    sportsCommitteeStructure,
    getSportsTrackByName,
} from '@/lib/constants';
import {
    ArrowLeft, ArrowRight, Check, CreditCard, AlertTriangle,
    User, Mail, Phone, Building, GraduationCap, BookOpen,
    ShieldCheck, Sparkles
} from 'lucide-react';

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => {
            on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
            open: () => void;
        };
    }
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];
const steps = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Events' },
    { id: 3, label: 'Payment' },
];

function getTeamBounds(event: Event): { min: number; max: number } {
    if (event.team_size_fixed && event.team_size_fixed > 0) {
        return { min: event.team_size_fixed, max: event.team_size_fixed };
    }

    if (event.team_size_min && event.team_size_max) {
        return { min: event.team_size_min, max: event.team_size_max };
    }

    if (event.team_size > 1) {
        return { min: event.team_size, max: event.team_size };
    }

    return { min: 1, max: 1 };
}

function needsTeamDetails(event: Event): boolean {
    return getTeamBounds(event).max > 1;
}

function getDefaultTeamSize(event: Event): number {
    return getTeamBounds(event).min;
}

function normalizeMembers(members: TeamMember[], expectedCount: number): TeamMember[] {
    const normalized = (members || []).slice(0, expectedCount);
    while (normalized.length < expectedCount) {
        normalized.push({ name: '' });
    }
    return normalized;
}

function estimateEventAmount(event: Event, teamRegistration?: TeamRegistration): number {
    const teamSize = needsTeamDetails(event)
        ? Math.max(1, teamRegistration?.team_size ?? getDefaultTeamSize(event))
        : 1;

    return event.fee_calculation === 'per_participant' ? event.fee * teamSize : event.fee;
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-manthan-black">
                <LoadingSpinner />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedEvent = searchParams.get('event');

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>(preselectedEvent ? [preselectedEvent] : []);
    const [formData, setFormData] = useState<RegistrationFormData>({
        name: '',
        email: '',
        phone: '',
        college: '',
        year: '',
        department: '',
        event_ids: [],
        team_registrations: [],
    });
    const [teamRegistrations, setTeamRegistrations] = useState<Record<string, TeamRegistration>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [razorpayReady, setRazorpayReady] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Fetch events and handle pre-selection resolution
    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch('/api/events');
                const data = await res.json();
                const fetchedEvents = data.events || [];
                setEvents(fetchedEvents);

                if (preselectedEvent) {
                    const event = fetchedEvents.find((e: Event) =>
                        e.slug === preselectedEvent || e.id === preselectedEvent
                    );
                    if (event) {
                        setSelectedIds([event.id]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch events:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, [preselectedEvent]);

    // Load Razorpay script
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            setRazorpayReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayReady(true);
        script.onerror = () => {
            setRazorpayReady(false);
            setPaymentError('Failed to load payment gateway. Please refresh and try again.');
        };
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Toggle event selection
    const toggleEvent = useCallback((id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((i) => i !== id);
            }
            return [...prev, id];
        });
        setErrors(errs => ({ ...errs, events: '' }));
    }, []);

    useEffect(() => {
        setTeamRegistrations((prev) => {
            const next: Record<string, TeamRegistration> = {};

            for (const event of events) {
                if (!selectedIds.includes(event.id) || !needsTeamDetails(event)) {
                    continue;
                }

                const existing = prev[event.id];
                const bounds = getTeamBounds(event);
                const safeSize = existing
                    ? Math.min(bounds.max, Math.max(bounds.min, existing.team_size))
                    : getDefaultTeamSize(event);

                next[event.id] = {
                    event_id: event.id,
                    team_name: existing?.team_name || '',
                    team_size: safeSize,
                    members: normalizeMembers(existing?.members || [], Math.max(0, safeSize)),
                };
            }

            return next;
        });
    }, [events, selectedIds]);

    const updateTeamRegistration = useCallback(
        (eventId: string, updater: (current: TeamRegistration) => TeamRegistration) => {
            setTeamRegistrations((prev) => {
                const event = events.find((entry) => entry.id === eventId);
                if (!event || !needsTeamDetails(event)) {
                    return prev;
                }

                const existing = prev[eventId] || {
                    event_id: eventId,
                    team_name: '',
                    team_size: getDefaultTeamSize(event),
                    members: normalizeMembers([], Math.max(0, getDefaultTeamSize(event))),
                };

                const updated = updater(existing);
                const bounds = getTeamBounds(event);
                const clampedSize = Math.min(bounds.max, Math.max(bounds.min, updated.team_size));

                return {
                    ...prev,
                    [eventId]: {
                        ...updated,
                        team_size: clampedSize,
                        members: normalizeMembers(updated.members || [], Math.max(0, clampedSize)),
                    },
                };
            });
        },
        [events]
    );

    const previewTotal = events
        .filter((e) => selectedIds.includes(e.id))
        .reduce((sum, e) => sum + estimateEventAmount(e, teamRegistrations[e.id]), 0);

    const selectedEvents = events.filter((e) => selectedIds.includes(e.id));

    const validateBasicInfo = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name || formData.name.trim().length < 2)
            newErrors.name = 'Name must be at least 2 characters';
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Enter a valid email address';
        if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone))
            newErrors.phone = 'Enter a valid 10-digit mobile number';
        if (!formData.college || formData.college.trim().length < 2)
            newErrors.college = 'College name is required';
        if (!formData.year)
            newErrors.year = 'Select your year';
        if (!formData.department || formData.department.trim().length < 1)
            newErrors.department = 'Department is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEvents = (): boolean => {
        if (selectedIds.length === 0) {
            setErrors({ events: 'Please select at least one event' });
            return false;
        }

        for (const event of selectedEvents) {
            if (!needsTeamDetails(event)) continue;

            const team = teamRegistrations[event.id];
            if (!team) {
                setErrors({ events: `Team details are required for ${event.name}` });
                return false;
            }

            const bounds = getTeamBounds(event);
            if (team.team_size < bounds.min || team.team_size > bounds.max) {
                setErrors({
                    events: bounds.min === bounds.max
                        ? `${event.name} requires exactly ${bounds.min} participants`
                        : `${event.name} team size must be between ${bounds.min} and ${bounds.max}`,
                });
                return false;
            }

            for (let index = 0; index < team.members.length; index++) {
                const member = team.members[index];
                if (!member.name || member.name.trim().length < 2) {
                    setErrors({ events: `${event.name}: teammate ${index + 1} name is required` });
                    return false;
                }
            }
        }

        setErrors({});
        return true;
    };

    const goNext = () => {
        if (step === 1 && !validateBasicInfo()) return;
        if (step === 2 && !validateEvents()) return;
        setDirection(1);
        setStep((s) => Math.min(s + 1, 3));
    };

    const goBack = () => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-form-field]');
            const current = document.activeElement;
            const arr = Array.from(inputs);
            const idx = arr.indexOf(current as HTMLInputElement | HTMLSelectElement);
            if (idx >= 0 && idx < arr.length - 1) {
                arr[idx + 1].focus();
            } else {
                goNext();
            }
        }
    };

    const handlePayment = async () => {
        if (processing) return;
        setProcessing(true);
        setPaymentMessage('');
        setPaymentError('');

        try {
            if (!validateBasicInfo() || !validateEvents()) {
                setProcessing(false);
                return;
            }

            if (!razorpayReady || !window.Razorpay) {
                throw new Error('Payment gateway is still loading. Please try again in a moment.');
            }

            if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
                throw new Error('Payment key is not configured. Please contact support.');
            }

            const teamPayload = selectedEvents
                .filter(needsTeamDetails)
                .map((event) => {
                    const team = teamRegistrations[event.id];
                    return {
                        event_id: event.id,
                        team_name: team.team_name?.trim() || null,
                        team_size: team.team_size,
                        members: team.members.map((member) => ({ name: member.name })),
                    };
                });

            const payload = {
                ...formData,
                event_ids: selectedIds,
                team_registrations: teamPayload,
            };

            const orderResponse = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order.');

            const checkout = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'Manthan 2026',
                description: `${selectedIds.length} event registration${selectedIds.length > 1 ? 's' : ''}`,
                order_id: orderData.order.id,
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: { color: '#8B0000' },
                handler: async (response: any) => {
                    setProcessing(true);
                    try {
                        const verifyResponse = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response),
                        });
                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok) throw new Error(verifyData.error || 'Verification failed.');
                        router.push(`/confirmation/${verifyData.ticket_id || orderData.ticket_id}`);
                    } catch (error) {
                        setPaymentError(getErrorMessage(error, 'Verification failed.'));
                    } finally {
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setPaymentError('Payment was cancelled.');
                        setProcessing(false);
                    },
                },
            });

            checkout.on('payment.failed', (response: any) => {
                setPaymentError(response.error?.description || 'Payment failed.');
                setProcessing(false);
            });

            checkout.open();
        } catch (error) {
            setPaymentError(getErrorMessage(error, 'Unable to start payment.'));
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-manthan-black">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-32 pb-20 px-4 min-h-screen relative">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-manthan-gold/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-manthan-maroon/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h1 className="font-ancient text-5xl md:text-6xl royal-header mb-6">Royal Inscription</h1>
                        <p className="font-serif italic text-manthan-gold/60 text-lg">Inscribe your name in the scrolls of Manthan 2026.</p>
                    </div>

                    <div className="flex items-center justify-between mb-12 relative max-w-md mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-manthan-gold/10 -translate-y-1/2 z-0" />
                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step >= s.id ? 'bg-manthan-gold border-manthan-gold text-manthan-black shadow-[0_0_15px_rgba(212,168,55,0.4)]' : 'bg-manthan-black border-manthan-gold/20 text-manthan-gold/40'}`}>
                                    {step > s.id ? <Check size={18} /> : <span className="font-ancient text-sm">{s.id}</span>}
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest mt-3 font-ancient ${step >= s.id ? 'text-manthan-gold' : 'text-gray-600'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <ScrollWrapper padding="p-8 md:p-14">
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ x: 20 * direction, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20 * direction, opacity: 0 }} transition={{ duration: 0.3 }}>
                                {step === 1 && <BasicInfoStep formData={formData} setFormData={setFormData} errors={errors} focusedField={focusedField} setFocusedField={setFocusedField} handleKeyDown={handleKeyDown} onNext={goNext} />}
                                {step === 2 && <EventSelectionStep events={events} selectedIds={selectedIds} toggleEvent={toggleEvent} error={errors.events} previewTotal={previewTotal} teamRegistrations={teamRegistrations} updateTeamRegistration={updateTeamRegistration} />}
                                {step === 3 && <PaymentStep formData={formData} selectedEvents={selectedEvents} previewTotal={previewTotal} teamRegistrations={teamRegistrations} razorpayReady={razorpayReady} paymentMessage={paymentMessage} paymentError={paymentError} />}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-12 pt-10 border-t border-manthan-maroon/10">
                            {step > 1 ? (
                                <button onClick={goBack} className="flex items-center text-manthan-maroon/60 hover:text-manthan-maroon transition-colors uppercase tracking-widest text-xs font-ancient">
                                    <ArrowLeft size={16} className="mr-2" /> Back
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <AnimatedButton icon={ArrowRight} onClick={goNext}>Continue Inscription</AnimatedButton>
                            ) : (
                                <AnimatedButton icon={CreditCard} onClick={handlePayment} className={processing ? 'opacity-50' : ''}>
                                    {processing ? 'Sealing...' : `Seal with ${formatFee(previewTotal)}`}
                                </AnimatedButton>
                            )}
                        </div>
                    </ScrollWrapper>
                </div>
            </main>
            <Footer />
        </>
    );
}

function FormField({ icon, label, error, focused, children }: { icon: any; label: string; error?: string; focused: boolean; children: any }) {
    return (
        <div>
            <label className="block text-xs font-medium text-[#3d2b1f]/60 mb-1.5 tracking-wide uppercase font-ancient">{label}</label>
            <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${error ? 'border-manthan-crimson/50 bg-manthan-crimson/5' : focused ? 'border-manthan-maroon/40 bg-manthan-maroon/5' : 'border-manthan-maroon/10 bg-black/5 hover:border-manthan-maroon/20'}`}>
                <div className={`pl-4 flex items-center justify-center transition-colors duration-300 ${focused ? 'text-manthan-maroon' : 'text-[#3d2b1f]/40'}`}>
                    {icon}
                    <div className="w-px h-6 bg-manthan-maroon/10 ml-4" />
                </div>
                {children}
            </div>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-manthan-crimson text-[10px] mt-1.5 font-serif italic">{error}</motion.p>}
        </div>
    );
}

function BasicInfoStep({ formData, setFormData, errors, focusedField, setFocusedField, handleKeyDown, onNext }: any) {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="font-ancient text-2xl sm:text-3xl text-manthan-maroon mb-2">Identity Details</h2>
                <p className="text-[#5c4033] font-serif italic">Inscribe your personal information into the records</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField icon={<User size={18} />} label="Full Name" error={errors.name} focused={focusedField === 'name'}>
                    <input data-form-field type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} placeholder="Enter your full name" className="w-full bg-transparent px-4 py-4 text-sm text-[#3d2b1f] font-serif placeholder:text-[#3d2b1f]/40 focus:outline-none" />
                </FormField>
                <FormField icon={<Mail size={18} />} label="Email Address" error={errors.email} focused={focusedField === 'email'}>
                    <input data-form-field type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} placeholder="your@email.com" className="w-full bg-transparent px-4 py-4 text-sm text-[#3d2b1f] font-serif placeholder:text-[#3d2b1f]/40 focus:outline-none" />
                </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">
                <FormField icon={<Phone size={18} />} label="Mobile Number" error={errors.phone} focused={focusedField === 'phone'}>
                    <input data-form-field type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} placeholder="10-digit mobile number" className="w-full bg-transparent px-4 py-4 text-sm text-[#3d2b1f] font-serif placeholder:text-[#3d2b1f]/40 focus:outline-none" />
                </FormField>
                <FormField icon={<Building size={18} />} label="College Name" error={errors.college} focused={focusedField === 'college'}>
                    <input data-form-field type="text" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })} onFocus={() => setFocusedField('college')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} placeholder="Enter your college name" className="w-full bg-transparent px-4 py-4 text-sm text-[#3d2b1f] font-serif placeholder:text-[#3d2b1f]/40 focus:outline-none" />
                </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField icon={<GraduationCap size={18} />} label="Year" error={errors.year} focused={focusedField === 'year'}>
                    <select data-form-field value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} onFocus={() => setFocusedField('year')} onBlur={() => setFocusedField(null)} className="w-full bg-transparent px-4 py-4 text-sm text-[#3d2b1f] font-serif focus:outline-none appearance-none">
                        <option value="">Select Year</option>
                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </FormField>
                <FormField icon={<BookOpen size={18} />} label="Department" error={errors.department} focused={focusedField === 'department'}>
                    <input data-form-field type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} onFocus={() => setFocusedField('department')} onBlur={() => setFocusedField(null)} onKeyDown={handleKeyDown} placeholder="e.g., Computer Science" className="w-full bg-transparent px-4 py-4 text-sm text-[#3d2b1f] font-serif placeholder:text-[#3d2b1f]/40 focus:outline-none" />
                </FormField>
            </div>
        </div>
    );
}

function EventSelectionStep({ events, selectedIds, toggleEvent, error, previewTotal, teamRegistrations, updateTeamRegistration }: any) {
    const categories = ['technical', 'cultural', 'sports'] as const;

    const renderEventCard = (event: Event) => {
        const isSelected = selectedIds.includes(event.id);
        const bounds = getTeamBounds(event);
        const teamLabel = bounds.min === bounds.max ? (bounds.max === 1 ? 'Solo' : `Troop of ${bounds.max}`) : `Troop ${bounds.min}-${bounds.max}`;
        const amountLabel = event.fee_calculation === 'per_participant' ? `${formatFee(event.fee)} / peer` : formatFee(event.fee);

        return (
            <motion.button key={event.id} onClick={() => toggleEvent(event.id)} whileTap={{ scale: 0.98 }} className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${isSelected ? 'border-manthan-maroon/40 bg-manthan-maroon/5 shadow-[0_0_20px_rgba(92,10,10,0.05)] scale-[1.02]' : 'border-manthan-maroon/10 bg-black/5 hover:border-manthan-maroon/20 hover:scale-[1.01]'}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-ancient text-lg mb-1 ${isSelected ? 'text-manthan-maroon' : 'text-[#3d2b1f]'}`}>{event.name}</h4>
                        <p className="text-[#5c4033] font-serif italic text-sm line-clamp-1 mb-2">{event.description}</p>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#3d2b1f]/40 font-ancient">
                            <span>{teamLabel}</span>
                            <span>·</span>
                            <span>{event.venue}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`font-ancient text-sm ${isSelected ? 'text-manthan-maroon' : 'text-[#3d2b1f]/60'}`}>{amountLabel}</span>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-manthan-maroon border-manthan-maroon' : 'border-manthan-maroon/20'}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                        </div>
                    </div>
                </div>
            </motion.button>
        );
    };

    return (
        <div className="space-y-8">
            <div className="mb-4">
                <h2 className="font-ancient text-2xl sm:text-3xl text-manthan-maroon mb-2">Sanctuary & Realms</h2>
                <p className="text-[#5c4033] font-serif italic mb-6">Select the chronicles you wish to join</p>
            </div>

            {error && <div className="p-4 bg-manthan-crimson/5 border border-manthan-crimson/10 rounded-xl text-manthan-crimson text-xs italic font-serif">{error}</div>}

            <div className="space-y-12">
                {categories.map((cat) => {
                    const catEvents = events.filter((e) => e.category === cat);
                    if (catEvents.length === 0) return null;
                    return (
                        <div key={cat}>
                            <h3 className={`font-ancient text-sm uppercase tracking-widest mb-4 border-b border-manthan-maroon/10 pb-2 ${categoryColors[cat].text}`}>
                                {categoryIcons[cat]} {cat} Realm
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {catEvents.map(renderEventCard)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedIds.length > 0 && (
                <div className="mt-12 space-y-6">
                    {events.filter(e => selectedIds.includes(e.id) && needsTeamDetails(e)).map(event => {
                        const team = teamRegistrations[event.id];
                        if (!team) return null;
                        const bounds = getTeamBounds(event);
                        return (
                            <div key={event.id} className="p-6 rounded-2xl border border-manthan-maroon/10 bg-manthan-maroon/5">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 p-4 border-b border-manthan-maroon/5">
                                    <h4 className="text-manthan-maroon font-ancient text-sm uppercase tracking-wider">{event.name} · Fellowship Details</h4>
                                    <span className="text-[10px] uppercase tracking-widest text-[#3d2b1f]/40 font-ancient">
                                        {event.fee_calculation === 'per_participant' ? 'Dues per peer' : 'Dues per troop'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <input type="text" value={team.team_name} onChange={e => updateTeamRegistration(event.id, c => ({ ...c, team_name: e.target.value }))} placeholder="Fellowship Name" className="w-full bg-white/50 border border-manthan-maroon/10 rounded-xl px-4 py-3 text-sm font-serif focus:outline-none" />
                                    <div className="flex items-center justify-between border border-manthan-maroon/10 rounded-xl px-4">
                                        <button onClick={() => updateTeamRegistration(event.id, c => ({ ...c, team_size: c.team_size - 1 }))} disabled={team.team_size <= bounds.min} className="p-2 text-manthan-maroon disabled:opacity-30">−</button>
                                        <span className="font-ancient text-sm">{team.team_size} peers</span>
                                        <button onClick={() => updateTeamRegistration(event.id, c => ({ ...c, team_size: c.team_size + 1 }))} disabled={team.team_size >= bounds.max} className="p-2 text-manthan-maroon disabled:opacity-30">+</button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {team.members.map((m, i) => (
                                        <input key={i} type="text" value={m.name} onChange={e => updateTeamRegistration(event.id, c => { const ms = [...c.members]; ms[i].name = e.target.value; return { ...c, members: ms }; })} placeholder={`Peer ${i + 1} Name`} className="w-full bg-white/50 border border-manthan-maroon/10 rounded-xl px-4 py-3 text-sm font-serif focus:outline-none" />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function PaymentStep({ formData, selectedEvents, previewTotal, teamRegistrations, razorpayReady, paymentMessage, paymentError }: any) {
    return (
        <div className="space-y-8">
            <div className="mb-4 text-center">
                <h2 className="font-ancient text-3xl text-manthan-maroon mb-2">The Final Seal</h2>
                <p className="text-[#5c4033] font-serif italic">Verify your inscriptions before sealing the record</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-manthan-maroon/10 bg-manthan-maroon/5 space-y-4">
                    <h3 className="font-ancient text-xs uppercase tracking-widest text-manthan-maroon">Your Scroll</h3>
                    <div className="space-y-2 font-serif text-sm">
                        <p><span className="text-[#3d2b1f]/40 uppercase text-[10px] tracking-widest mr-2">Name:</span> {formData.name}</p>
                        <p><span className="text-[#3d2b1f]/40 uppercase text-[10px] tracking-widest mr-2">Email:</span> {formData.email}</p>
                        <p><span className="text-[#3d2b1f]/40 uppercase text-[10px] tracking-widest mr-2">Origin:</span> {formData.college}</p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-manthan-maroon/10 bg-manthan-maroon/5 space-y-4">
                    <h3 className="font-ancient text-xs uppercase tracking-widest text-manthan-maroon">Chosen Realms</h3>
                    <div className="space-y-3">
                        {selectedEvents.map(e => (
                            <div key={e.id} className="flex justify-between items-center text-sm font-serif">
                                <span className="text-[#3d2b1f]">{e.name}</span>
                                <span className="text-manthan-maroon font-bold">{formatFee(estimateEventAmount(e, teamRegistrations[e.id]))}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-2xl border-2 border-manthan-maroon/10 bg-manthan-maroon/5 text-center">
                <p className="text-[#3d2b1f]/60 uppercase tracking-[0.2em] text-[10px] font-ancient mb-2">Total Dues</p>
                <p className="text-5xl font-ancient text-manthan-maroon">{formatFee(previewTotal)}</p>
            </div>

            <div className="flex items-start gap-4 p-4 bg-manthan-maroon/5 rounded-xl border border-manthan-maroon/10">
                <ShieldCheck className="text-manthan-maroon mt-1" size={20} />
                <p className="text-[#5c4033] font-serif italic text-xs leading-relaxed">Secure payment via Royal Razorpay. Your inscription is final only after successful dues are cleared.</p>
            </div>

            {paymentError && <div className="p-4 bg-manthan-crimson/5 border border-manthan-crimson/10 rounded-xl text-manthan-crimson text-xs italic font-serif flex items-center gap-3"><AlertTriangle size={18} /> {paymentError}</div>}
        </div>
    );
}
