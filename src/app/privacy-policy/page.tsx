import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-manthan-gold/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-manthan-maroon/5 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-visible">
                <div className="w-full max-w-4xl overflow-visible">
                    <div className="parchment-container rounded-none parchment-theme">
                        <div className="scroll-roll" />
                        <div className="parchment-body p-8 sm:p-12 md:p-16 shrink-0">
                            <div className="mb-10 text-center border-b border-manthan-maroon/10 pb-8">
                                <h1 className="font-ancient text-4xl sm:text-5xl font-bold text-[#3d2b1f] mb-4">
                                    Privacy Policy
                                </h1>
                                <p className="text-[#5c4033] text-sm italic font-ancient">
                                    How the Archives Protect Your Identity
                                </p>
                            </div>

                            <div className="space-y-8 text-[#3d2b1f] leading-relaxed font-ancient">
                                <p>
                                    Welcome to the official portal of Manthan 2026. This Privacy Codex details how we collect, use, and protect your personal details when you enter our archives or register for the trials.
                                </p>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">1. Information We Collect</h2>
                                    <ul className="list-disc pl-6 space-y-3">
                                        <li><strong>Identify Details:</strong> Name, email address, signal number (phone), college name, and course details when you register for trials.</li>
                                        <li><strong>Offering Details:</strong> We use secure gates like Razorpay. We do not store your gold vault (bank) details.</li>
                                        <li><strong>Scroll Usage:</strong> Information about how you navigate and interact with our digital scrolls.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">2. How We Use Your Details</h2>
                                    <ul className="list-disc pl-6 space-y-3">
                                        <li>To process your inscription and participation in Manthan 2026 trials.</li>
                                        <li>To send important proclamations, announcements, and event-related scrolls.</li>
                                        <li>To process offerings and prevent fraudulent activities.</li>
                                        <li>To improve our portal functionality and seeker experience.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">3. Data Guardianship</h2>
                                    <p>
                                        We do not barter, trade, or rent your personal details to outside guilds. Your data is strictly used for the execution of Manthan 2026. We implement industry-standard security wards to protect your information against unauthorized access, alteration, or destruction.
                                    </p>
                                </section>

                                <div className="mt-12 pt-8 border-t border-manthan-maroon/10 text-center">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-manthan-maroon/60 mb-4">Contact the Gatekeepers</h3>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Codex:</strong> principal.bvimit@bharatividyapeeth.edu</p>
                                        <p><strong>Sanctum:</strong> BVIMIT, Sector-8, Belapur, CBD, Navi Mumbai - 400614</p>
                                    </div>
                                    <p className="text-[10px] text-manthan-maroon/40 mt-8 font-medium uppercase tracking-[0.2em]">Inscribed: March 2026</p>
                                </div>
                            </div>
                        </div>
                        <div className="scroll-roll rotate-180" />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
