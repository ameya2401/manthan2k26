import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
    title: 'Manthan 2026 | Tech Fest',
    description:
        'Manthan 2026 - The ultimate college tech fest at Bharati Vidyapeeth Belapur, featuring technical, cultural, and sports events. Register now!',
    keywords: ['manthan', 'tech fest', 'college fest', 'hackathon', 'cultural fest', 'BVIMIT', 'Belapur', 'Navi Mumbai'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/manthan_final_logo.png" />
                {/* Preload the intro video aggressively so it starts downloading before React even boots */}
                <link
                    rel="preload"
                    href="https://manthan-cdn.ameyabhagat24.workers.dev/p2.mp4"
                    as="video"
                    type="video/mp4"
                />
            </head>
            <body className="min-h-screen text-gray-200 antialiased overflow-x-hidden">
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
