import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { register, user, loading, verificationEmail, resendVerificationEmail, setVerificationEmail } = useAuth();

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
    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok');
      return;
    }
    if (!agreeTerms) {
      setError('Harap setujui Syarat & Ketentuan');
      return;
    }
    try {
      await register(email, password, displayName);
      setRegistered(true);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail(email);
      setError('');
      alert('Email verifikasi telah dikirim ulang. Silakan cek kotak masuk Anda.');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang email verifikasi');
    }
    setResending(false);
  };

  if (loading) return null;

  if (user) return null;

  return (
    <>
      <Head>
        <title>Daftar – PsyOasis</title>
        <meta name="description" content="Buat akun PsyOasis dan mulai perjalanan kesehatan mental Anda bersama psikolog profesional." />
      </Head>
      <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex items-center justify-center relative overflow-x-hidden">
        {/* Background gradient */}
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-secondary-fixed/30 via-surface/90 to-primary/20">
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/3 -left-32 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-fixed/10 rounded-full blur-[200px] pointer-events-none" />
        </div>

        <main className="relative z-10 w-full max-w-lg px-5 md:px-0 mx-auto py-12">
          <div className="glass-card rounded-[24px] shadow-[0_8px_32px_rgba(0,39,104,0.08)] p-8 md:p-12">
            {/* Logo & Header */}
            <div className="text-center mb-10">
              <Link href="/" className="w-16 h-16 mx-auto mb-6 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-surface-variant">
                <img src="/logo.png" alt="PsyOasis Logo" className="w-full h-full object-contain" />
              </Link>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-3">Mulai Perjalanan Anda</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Bergabunglah dengan ribuan orang yang telah menemukan kedamaian.</p>
            </div>

            {error && (
              <div className="bg-error-container/50 border border-error/20 text-on-error-container text-sm px-4 py-3 rounded-xl text-center mb-6">
                {error}
              </div>
            )}

            {registered && verificationEmail ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-5 bg-primary-fixed rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Cek Email Anda</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-2">
                  Kami telah mengirim email verifikasi ke
                </p>
                <p className="font-label-md text-label-md text-primary font-semibold mb-6">{verificationEmail}</p>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Klik tautan di email untuk mengaktifkan akun Anda, lalu masuk ke PsyOasis.
                </p>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full py-4 px-8 rounded-xl font-label-md text-label-md text-primary border border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  {resending ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                </button>
                <div className="mt-6 pt-6 border-t border-outline-variant/30">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Sudah verifikasi?{' '}
                    <a href="/login" className="font-label-md text-label-md text-primary hover:underline">Masuk sekarang</a>
                  </p>
                </div>
              </div>
            ) : (
              <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="displayName">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">person</span>
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="block w-full pl-11 pr-4 py-4 h-[56px] bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock_reset</span>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-11 pr-12 py-4 h-[56px] bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface focus:outline-none"
                    aria-label="Toggle confirm password visibility"
                  >
                    <span className="material-symbols-outlined text-outline transition-colors">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start mt-2">
                <div className="flex items-center h-6">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="w-5 h-5 bg-surface-container-lowest border-outline-variant rounded text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-body-md text-body-md text-on-surface-variant" htmlFor="terms">
                    Saya menyetujui{' '}
                    <a href="#" className="font-semibold text-primary hover:text-primary-container hover:underline transition-colors">Syarat &amp; Ketentuan</a> serta{' '}
                    <a href="#" className="font-semibold text-primary hover:text-primary-container hover:underline transition-colors">Kebijakan Privasi</a>.
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-8 rounded-xl shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1 mt-2"
              >
                Daftar
              </button>
            </form>

                {/* Login link */}
                <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
                  Sudah punya akun?{' '}
                  <a href="/login" className="font-label-md text-label-md text-primary hover:text-primary-container hover:underline transition-colors ml-1">Masuk</a>
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}