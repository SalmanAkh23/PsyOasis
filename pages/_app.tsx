import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import Router from 'next/router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import { ToastProvider } from '../components/ui/Toast'

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 flex items-center justify-center shadow-md animate-pulse">
          <img src="/logo.png" alt="PsyOasis" className="h-full w-auto object-contain" />
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-on-surface">PsyOasis sedang mempersiapkan ruang aman Anda...</div>
          <div className="text-sm text-on-surface-variant mt-2">Harap tunggu sebentar — kami memuat pengaturan Anda.</div>
        </div>
      </div>
    </div>
  )
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If visiting root and already logged in, redirect to dashboard
      if (router.pathname === '/' && user) {
        router.replace('/dashboard');
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    const protectedPrefixes = ['/dashboard', '/konsultasi', '/profile'];
    const handleRouteChange = (url: string) => {
      try {
        const next = new URL(url, window.location.origin).pathname;
        if (!user && protectedPrefixes.some((p) => next.startsWith(p))) {
          router.replace('/');
        }
        if (user && next === '/') {
          router.replace('/dashboard');
        }
      } catch (e) {
        // ignore
      }
    };

    Router.events.on('routeChangeStart', handleRouteChange);
    return () => Router.events.off('routeChangeStart', handleRouteChange);
  }, [router, user]);

  if (loading) return <FullScreenLoader />;
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        const id = hash.replace('#', '')
        // wait for DOM to mount
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }

    const handleRouteChange = (url: string) => {
      const hashIndex = url.indexOf('#')
      if (hashIndex !== -1) {
        const id = url.slice(hashIndex + 1)
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }

    Router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return (
    <AuthProvider>
      <AuthGate>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </AuthGate>
    </AuthProvider>
  );
}
