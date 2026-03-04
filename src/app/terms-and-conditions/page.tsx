import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsAndConditionsPage() {
    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-manthan-gold/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 glass-card p-8 md:p-12 mt-12">
                    <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient mb-8 text-center">
                        Terms and Conditions
                    </h1>
                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p>
                            By accessing or using the Manthan 2026 website and registering for events, you agree to comply with and be bound by the following Terms and Conditions.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">1. General Rules</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Manthan 2026 is a student-centric tech and cultural fest organized by BVIMIT, Navi Mumbai.</li>
                            <li>Participants are expected to maintain professionalism, discipline, and decorum throughout the fest.</li>
                            <li>Any form of misbehavior, plagiarism, or rule violation during the events will lead to immediate disqualification.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">2. Event Registrations</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All registrations must be completed through this official portal.</li>
                            <li>Providing incorrect or fraudulent information during registration may lead to cancellation of participation.</li>
                            <li>The organizing committee reserves the right to modify event schedules, rules, or formats without prior individual notice. Updates will be posted on the website.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">3. Payments and Billing</h2>
                        <p>
                            Payments for paid events must be made through our authorized payment gateway (Razorpay). You agree to provide current, complete, and accurate purchase and account information for all purchases made via this site. By making a payment, you also agree to our Refund Policy.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">4. Liability</h2>
                        <p>
                            The organizing committee of Manthan 2026 and BVIMIT is not liable for any unpredicted delays, technical glitches, or circumstances beyond our control that may affect the event schedule or transactions.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">5. Contact Information</h2>
                        <p>
                            For further queries relating to these terms, contact:<br />
                            <strong>Email:</strong> principal.bvimit@bharatividyapeeth.edu <br />
                            <strong>Phone:</strong> 022-27578415 / +91 8657008016
                        </p>
                        <p className="text-sm text-gray-500 mt-8 font-medium">Last Updated: March 2026</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
