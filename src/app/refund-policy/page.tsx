import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative overflow-hidden">
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-manthan-crimson/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 glass-card p-8 md:p-12 mt-12">
                    <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient mb-8 text-center">
                        Refund & Cancellation Policy
                    </h1>
                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p>
                            At Manthan 2026, we strive to ensure a smooth registration process for all our tech and cultural events. Please read our refund and cancellation policy carefully before making any payments.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">1. Non-Refundable Registrations</h2>
                        <p>
                            Generally, all fees paid towards event registrations, passes, or sponsorships for Manthan 2026 are <strong>non-refundable</strong>. Once a successful payment is made and a registration slot is confirmed, it cannot be canceled or refunded under normal circumstances.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">2. Exceptions & Dispute Resolution</h2>
                        <p>
                            Refunds will be considered strictly under the following exceptional conditions:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Multiple Deductions:</strong> If multiple deductions occur for a single transaction due to technical glitches or gateway errors, the duplicate amount will be refunded.</li>
                            <li><strong>Event Cancellation:</strong> If a specific event is canceled by the Manthan 2026 organizing committee and no alternative event is provided, registered participants of that specific event will be eligible for a refund.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">3. Refund Process</h2>
                        <p>
                            If you meet the criteria for an exceptional refund, please reach out to our team within 3 days of the transaction.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide transaction details, email used for registration, and proof of double payment (if applicable).</li>
                            <li>Approved refunds will be processed and credited back to the original source of payment within 5-7 business days.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">4. Contact Point</h2>
                        <p>
                            For all payment and refund-related disputes, contact:<br />
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
