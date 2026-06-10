import React, { useEffect, useState } from 'react';
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
        scrolled ? 'bg-white/60 backdrop-blur-sm border border-[#709085]/8 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4A7A96] to-[#709085] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold font-space text-[#2D3732] tracking-wide">
            Psy<span className="text-[#4A7A96]">Oasis</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`text-sm font-medium transition-colors relative group py-1 ${
                activeLink === link.href.slice(1) ? 'text-[#2D3732]' : 'text-[#2D3732]/70'
              }`}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#4A7A96] to-[#709085] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center gap-3">
          {!loading && !user && (
            <>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4A7A96] rounded-lg hover:bg-[#3D6B82] transition"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 text-sm font-medium text-[#709085] bg-white rounded-lg border border-[#709085]/40 hover:bg-[#709085]/10 transition"
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
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#709085]/20"
                />
                <span className="text-[#2D3732]">{user.displayName || user.email}</span>
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
