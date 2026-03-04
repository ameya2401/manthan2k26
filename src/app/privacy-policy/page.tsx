import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative overflow-hidden">
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 glass-card p-8 md:p-12 mt-12">
                    <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient mb-8 text-center">
                        Privacy Policy
                    </h1>
                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p>
                            Welcome to Manthan 2026. This Privacy Policy details how we collect, use, and protect your personal information when you use our website or register for our events.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">1. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, college name, and course details when you register for events.</li>
                            <li><strong>Payment Information:</strong> We use secure payment gateways like Razorpay. We do not store your credit card or bank account details.</li>
                            <li><strong>Usage Data:</strong> Information about how you navigate and interact with our website.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">2. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To process your registration and participation in Manthan 2026 events.</li>
                            <li>To send important updates, announcements, and event-related communications.</li>
                            <li>To process payments and prevent fraudulent transactions.</li>
                            <li>To improve our website functionality and user experience.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">3. Data Sharing and Security</h2>
                        <p>
                            We do not sell, trade, or rent your personal information to third parties. Your data is strictly used for the execution of Manthan 2026. We implement industry-standard security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
                        </p>

                        <h2 className="text-2xl font-bold text-manthan-gold mt-8 mb-4">4. Contact Us</h2>
                        <p>
                            If you have any questions relating to this Privacy Policy or your data, please contact us at: <br />
                            <strong>Email:</strong> principal.bvimit@bharatividyapeeth.edu <br />
                            <strong>Address:</strong> Bharati Vidyapeeth&apos;s Institute of Management and Information Technology (BVIMIT), Sector-8, Belapur, CBD, Navi Mumbai - 400614
                        </p>
                        <p className="text-sm text-gray-500 mt-8 font-medium">Last Updated: March 2026</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
