import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-manthan-crimson/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-manthan-gold/10 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-visible">
                <div className="w-full max-w-4xl overflow-visible">
                    <div className="parchment-container rounded-none parchment-theme">
                        <div className="scroll-roll" />
                        <div className="parchment-body p-8 sm:p-12 md:p-16 shrink-0">
                            <div className="mb-10 text-center border-b border-manthan-maroon/10 pb-8">
                                <h1 className="font-ancient text-4xl sm:text-5xl font-bold text-[#3d2b1f] mb-4 text-center">
                                    Refund & Cancellation
                                </h1>
                                <p className="text-[#5c4033] text-sm italic font-ancient">
                                    Decrees Concerning the Exchange of Offerings
                                </p>
                            </div>

                            <div className="space-y-8 text-[#3d2b1f] leading-relaxed font-ancient">
                                <p className="italic">
                                    At Manthan 2026, we strive to ensure a smooth registration process for all our tech and cultural trials. Please read our refund and cancellation decrees carefully before making any offerings.
                                </p>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">1. Non-Refundable Offerings</h2>
                                    <p>
                                        Generally, all gold paid towards event inscriptions, passes, or sponsorships for Manthan 2026 is <strong>non-refundable</strong>. Once a successful offering is made and a seeker slot is confirmed, it cannot be canceled or refunded under normal circumstances.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">2. Exceptional Decrees</h2>
                                    <p>
                                        Refunds will be considered strictly under the following exceptional conditions:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-3">
                                        <li><strong>Multiple Deductions:</strong> If multiple deductions occur for a single transaction due to technical glitches or gateway errors, the duplicate gold will be returned to your vault.</li>
                                        <li><strong>Trial Cancellation:</strong> If a specific trial is canceled by the Manthan council and no alternative trial is provided, registered seekers of that specific trial will be eligible for a refund.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">3. The Return Process</h2>
                                    <p>
                                        If you meet the criteria for an exceptional refund, please reach out to our chroniclers within 3 suns (days) of the transaction.
                                    </p>
                                    <ul className="list-disc pl-6 space-y-3">
                                        <li>Provide transaction scrolls, codex (email) used for registration, and proof of double offering.</li>
                                        <li>Approved refunds will be processed and credited back to the original source of gold within 5-7 business suns.</li>
                                    </ul>
                                </section>

                                <div className="mt-12 pt-8 border-t border-manthan-maroon/10 text-center">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-manthan-maroon/60 mb-4">Appeal to the Chroniclers</h3>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Codex:</strong> principal.bvimit@bharatividyapeeth.edu</p>
                                        <p><strong>Signal:</strong> 022-27578415 / +91 8657008016</p>
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
