'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                const debugReason = data?.debug?.reason ? ` (${data.debug.reason})` : '';
                setError((data.error || 'Login failed') + debugReason);
                return;
            }

            // Store admin session
            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            router.push('/admin/dashboard');
        } catch {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 bg-manthan-black">
            <div className="glass-card p-10 w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-manthan-maroon/20 flex items-center justify-center mb-4">
                        <Lock size={28} className="text-manthan-gold" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-gold-gradient">Admin Login</h1>
                    <p className="text-gray-500 text-sm mt-2">Manthan 2026 Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-manthan-black/50 border border-manthan-gold/20 text-gray-200 text-sm focus:border-manthan-gold/50 focus:outline-none focus:ring-1 focus:ring-manthan-gold/30 transition-colors"
                            placeholder="admin@manthan.in"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-manthan-black/50 border border-manthan-gold/20 text-gray-200 text-sm focus:border-manthan-gold/50 focus:outline-none focus:ring-1 focus:ring-manthan-gold/30 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-manthan-crimson text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-semibold rounded-lg hover:from-manthan-crimson hover:to-manthan-maroon transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </main>
    );
}
