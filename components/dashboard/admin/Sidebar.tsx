import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', section: 'dashboard', icon: 'dashboard' },
  { label: 'User Management', section: 'users', icon: 'group' },
  { label: 'Psychologist Mgmt', section: 'psikolog', icon: 'psychology' },
  { label: 'Appointments', section: 'appointments', icon: 'calendar_today' },
  { label: 'Content CMS', section: 'content', icon: 'article' },
  { label: 'System Settings', section: 'settings', icon: 'settings' },
];

interface Props {
  secret: string;
  onNavigate?: (section: string) => void;
  activeSection?: string;
}

export default function AdminSidebar({ secret, onNavigate, activeSection }: Props) {
  const { logout } = useAuth() as any;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <nav className="w-64 h-full fixed left-0 top-0 bg-surface-container-lowest shadow-sm flex flex-col py-stack-lg z-20 border-r border-outline-variant/20">
      <button onClick={() => onNavigate?.('dashboard')} className="px-gutter mb-stack-lg flex items-center gap-3 w-full text-left cursor-pointer hover:opacity-80 transition-opacity">
        <img src="/logo.png" alt="PsyOasis" className="h-16 w-auto object-contain" />
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Admin Console</p>
        </div>
      </button>

      <div className="flex-1 px-stack-sm flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = activeSection === item.section;
          return (
            <button
              key={item.section}
              onClick={() => onNavigate?.(item.section)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left w-full ${
                active
                  ? 'bg-secondary-container/40 text-on-secondary-container border-l-[3px] border-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-stack-sm space-y-0.5">
        <div className="border-t border-outline-variant/20 my-2 mx-3"></div>
        <a
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors duration-200 w-full"
        >
          <span className="material-symbols-outlined text-lg">switch_account</span>
          <span className="font-label-md text-label-md">Patient Portal</span>
        </a>
        <a
          href="/dashboard/portal"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors duration-200 w-full"
        >
          <span className="material-symbols-outlined text-lg">local_hospital</span>
          <span className="font-label-md text-label-md">Doctor Portal</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/30 transition-colors duration-200 mt-0.5 text-left"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="font-label-md text-label-md">Logout</span>
        </button>
      </div>
    </nav>
  );
}
