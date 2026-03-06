import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Background Glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-manthan-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <main className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-visible">
                <div className="w-full max-w-4xl overflow-visible">
                    <div className="parchment-container rounded-none parchment-theme">
                        <div className="scroll-roll" />
                        <div className="parchment-body p-8 sm:p-12 md:p-16 shrink-0">
                            <div className="mb-10 text-center border-b border-manthan-maroon/10 pb-8">
                                <h1 className="font-ancient text-4xl sm:text-5xl font-bold text-[#3d2b1f] mb-4">
                                    Terms & Conditions
                                </h1>
                                <p className="text-[#5c4033] text-sm italic font-ancient">
                                    The Sacred Laws Governing the Realm of Manthan
                                </p>
                            </div>

                            <div className="space-y-8 text-[#3d2b1f] leading-relaxed font-ancient">
                                <p className="italic">
                                    By accessing or using the Manthan 2026 portal and inscribing your name for the trials, you agree to comply with and be bound by the following Terms and Conditions of our Guild.
                                </p>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">1. General Rules</h2>
                                    <ul className="list-disc pl-6 space-y-3">
                                        <li>Manthan 2026 is a student-centric tech and cultural fest organized by BVIMIT, Navi Mumbai.</li>
                                        <li>Participants are expected to maintain professionalism, discipline, and decorum throughout the fest.</li>
                                        <li>Any form of misbehavior, plagiarism, or rule violation during the events will lead to immediate disqualification by the Grand Masters.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">2. Event Inscriptions</h2>
                                    <ul className="list-disc pl-6 space-y-3">
                                        <li>All registrations must be completed through this official digital scroll (portal).</li>
                                        <li>Providing incorrect or fraudulent information during registration may lead to cancellation of participation and forfeiture of offerings.</li>
                                        <li>The organizing committee reserves the right to modify event schedules, rules, or formats without prior individual notice. Updates will be posted on the portal.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">3. Offerings and Gold (Payments)</h2>
                                    <p>
                                        Payments for paid trials must be made through our authorized gatekeeper (Razorpay). You agree to provide current, complete, and accurate information for all transactions. By making an offering, you also agree to our Refund Policy.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-manthan-maroon mb-4 uppercase tracking-wider">4. Liability</h2>
                                    <p>
                                        The council of Manthan 2026 and BVIMIT is not liable for any unpredicted delays, technical glitches, or circumstances beyond our control that may affect the trial schedule or inscriptions.
                                    </p>
                                </section>

                                <div className="mt-12 pt-8 border-t border-manthan-maroon/10 text-center">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-manthan-maroon/60 mb-4">Seek the Council</h3>
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
