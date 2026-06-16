import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('beranda');
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Update navbar background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver to track active section
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const links = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Layanan', href: '#layanan' },
    { name: 'Psikolog', href: '#psikolog' },
    { name: 'Tentang Kami', href: '#tentang-kami' },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const target = document.querySelector(href);
    if (target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav
      className={`fixed top-4 left-0 right-0 z-50 w-full px-4 transition-all duration-300 ${
        scrolled ? 'bg-white/60 backdrop-blur-sm border border-[#006d31]/8 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <img src="/logo.png" alt="PsyOasis" className="h-20 w-auto object-contain" />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`text-sm font-medium transition-colors relative group py-1 ${
                activeLink === link.href.slice(1) ? 'text-[#1a1c1e]' : 'text-[#1a1c1e]/70'
              }`}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#315ab4] to-[#006d31] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center gap-3">
          {!loading && !user && (
            <>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-[#315ab4] rounded-lg hover:bg-[#3D6B82] transition"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 text-sm font-medium text-[#006d31] bg-white rounded-lg border border-[#006d31]/40 hover:bg-[#006d31]/10 transition"
              >
                Daftar
              </button>
            </>
          )}
          {user && (
            <div className="relative group">
              <button className="flex items-center space-x-2 text-sm focus:outline-none">
                <img
                  src={user.photoURL || '/icons/default-avatar.png'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#006d31]/20"
                />
                <span className="text-[#1a1c1e]">{user.displayName || user.email}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ul className="py-1">
                  <li>
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profil Saya
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
