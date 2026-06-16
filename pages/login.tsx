import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle, user, loading, resendVerificationEmail, setVerificationEmail } = useAuth();

  useEffect(() => {
    setVerificationEmail(null);
    if (!loading && user) {
      router.replace('/dashboard');
    }
    return () => setVerificationEmail(null);
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email not verified')) {
        setUnverifiedEmail(email);
        setError('Email belum diverifikasi. Silakan cek kotak masuk Anda untuk link verifikasi.');
      } else {
        setError(msg);
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail(unverifiedEmail || email);
      setError('');
      alert('Email verifikasi telah dikirim ulang. Silakan cek kotak masuk Anda.');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang email verifikasi');
    }
    setResending(false);
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  if (loading) return null;

  if (user) return null;

  return (
    <>
      <Head>
        <title>Masuk – PsyOasis</title>
        <meta name="description" content="Masuk ke akun PsyOasis Anda untuk mengakses layanan konsultasi psikologi." />
      </Head>
      <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex items-center justify-center relative overflow-x-hidden">
        {/* Background gradient */}
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-primary/20 via-surface/90 to-secondary-fixed/30">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-secondary-fixed/10 rounded-full blur-[200px] pointer-events-none" />
        </div>

        <main className="relative z-10 w-full max-w-lg px-5 md:px-0 mx-auto py-12">
          <div className="glass-card rounded-[24px] shadow-[0_8px_32px_rgba(0,39,104,0.08)] p-8 md:p-12">
            {/* Logo & Header */}
            <div className="text-center mb-10">
              <Link href="/" className="w-16 h-16 mx-auto mb-6 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-surface-variant">
                <img src="/logo.png" alt="PsyOasis Logo" className="w-full h-full object-contain" />
              </Link>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-3">Selamat Datang Kembali</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Masuk untuk melanjutkan perjalanan Anda.</p>
            </div>

            {error && (
              <div className="bg-error-container/50 border border-error/20 text-on-error-container text-sm px-4 py-3 rounded-xl text-center mb-6">
                <p>{error}</p>
                {unverifiedEmail && (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all disabled:opacity-50"
                  >
                    {resending ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="block w-full pl-11 pr-4 py-4 h-[56px] bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-11 pr-12 py-4 h-[56px] bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-outline transition-colors">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-8 rounded-xl shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1 mt-2"
              >
                Masuk
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-outline-variant/50" />
              <span className="text-sm text-on-surface-variant/60">atau</span>
              <div className="flex-1 h-px bg-outline-variant/50" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex justify-center items-center gap-3 py-4 px-8 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 font-body-md text-body-md text-on-surface"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Masuk dengan Google
            </button>

            {/* Register link */}
            <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
              Belum punya akun?{' '}
              <a href="/register" className="font-label-md text-label-md text-primary hover:text-primary-container hover:underline transition-colors ml-1">Daftar sekarang</a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}