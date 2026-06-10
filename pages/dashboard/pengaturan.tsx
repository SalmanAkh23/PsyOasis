import React from 'react'
import Head from 'next/head'
import Sidebar from '../../components/dashboard/Sidebar'
import Topbar from '../../components/dashboard/Topbar'
import { useAuth } from '../../contexts/AuthContext'

export default function PengaturanPage() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Pengaturan – PsyOasis</title>
      </Head>

      <div className="min-h-screen bg-[#F7F9F6] flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Topbar />
          <main className="mt-6">
            <h1 className="text-2xl font-bold text-[#2D3732]">Pengaturan Akun</h1>
            <p className="mt-2 text-[#2D3732]/60">Halaman placeholder untuk pengaturan akun dan preferensi.</p>
          </main>
        </div>
      </div>
    </>
  )
}
