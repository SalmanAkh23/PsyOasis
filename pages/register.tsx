import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, user, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, displayName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  // If already logged in, redirect to dashboard
  if (!loading && user) {
    if (typeof window !== 'undefined') {
      router.replace('/dashboard');
    }
    return null;
  }

  return (
    <>
      <Head>
        <title>Daftar – PsyOasis</title>
        <meta name="description" content="Buat akun PsyOasis dan mulai perjalanan kesehatan mental Anda bersama psikolog profesional." />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9F6] p-4 relative overflow-hidden">
        {/* Background ambient glows */}
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#709085]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-[#4A7A96]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/75 backdrop-blur-md p-8 shadow-[0_8px_40px_rgba(74,122,150,0.12)] border border-[#709085]/15 relative z-10">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#4A7A96] to-[#709085] flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold font-space text-[#2D3732]">Psy<span className="text-[#4A7A96]">Oasis</span></h1>
              <p className="text-xs text-[#2D3732]/50 mt-0.5">A calm and safe oasis for mental wellbeing</p>
            </div>
          </div>

          <h2 className="text-center text-xl font-bold text-[#2D3732] font-space">Daftar Akun Baru</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#709085]/25 bg-[#F7F9F6] px-4 py-3 text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/25 focus:border-[#4A7A96]/50 text-sm transition-all psy-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#709085]/25 bg-[#F7F9F6] px-4 py-3 text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/25 focus:border-[#4A7A96]/50 text-sm transition-all psy-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#709085]/25 bg-[#F7F9F6] px-4 py-3 text-[#2D3732] placeholder-[#709085]/60 focus:outline-none focus:ring-2 focus:ring-[#4A7A96]/25 focus:border-[#4A7A96]/50 text-sm transition-all psy-input"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#4A7A96] px-4 py-3 font-semibold text-white hover:bg-[#3D6B82] transition-all duration-300 shadow-[0_4px_15px_rgba(74,122,150,0.25)] hover:shadow-[0_4px_20px_rgba(74,122,150,0.35)] text-sm"
            >
              Daftar
            </button>
          </form>

          <p className="text-center text-xs text-[#2D3732]/50">
            Sudah punya akun?{' '}
            <a href="/login" className="text-[#4A7A96] font-semibold hover:underline">Masuk di sini</a>
          </p>
        </div>
      </div>
    </>
  );
}
