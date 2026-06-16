import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth() as any;

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.replace(`/admin/${adminSecret}`);
      } else {
        setError('Akun ini tidak memiliki akses admin');
      }
    }
  }, [authLoading, user, router, adminSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    }
    setLoading(false);
  };

  if (authLoading) return null;

  return (
    <>
      <Head>
        <title>Admin Login – PsyOasis CMS</title>
        <meta name="description" content="PsyOasis Admin Panel Login" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/10 via-transparent to-secondary-fixed/10 pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-primary-fixed/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-secondary-fixed/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl border border-outline-variant/30 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8">
            <Link href="/" className="flex flex-col items-center gap-3 mb-8">
              <img src="/logo.png" alt="PsyOasis" className="h-32 w-auto object-contain" />
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 tracking-wide">ADMIN CMS PANEL</p>
            </Link>

            <h2 className="text-center font-label-md text-label-md text-on-surface mb-6">Masuk ke Admin Panel</h2>

            {error && (
              <div className="bg-error-container/50 border border-error/20 text-on-error-container text-sm px-4 py-3 rounded-lg text-center mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Email Admin</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg bg-surface border border-outline-variant/30 pl-10 pr-4 py-3 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-body-md text-body-md"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg bg-surface border border-outline-variant/30 pl-10 pr-4 py-3 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-body-md text-body-md"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary text-on-primary py-3 font-label-md text-label-md font-semibold hover:bg-primary-container transition-all duration-200 active:scale-[0.98] shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                {loading ? 'Memverifikasi...' : 'Masuk ke Admin Panel'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-outline-variant/20">
              <a
                href="/login"
                className="block text-center font-label-sm text-label-sm text-outline hover:text-primary transition-colors"
              >
                Kembali ke halaman login user
              </a>
            </div>
          </div>

          <p className="text-center font-caption text-caption text-outline/50 mt-4">
            &copy; {new Date().getFullYear()} PsyOasis Admin Panel. Restricted access.
          </p>
        </div>
      </div>
    </>
  );
}
