import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminTopbar() {
  const { user } = useAuth() as any;
  const displayName = user?.displayName || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-256px)] h-16 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 flex justify-between items-center px-margin-desktop z-10">
      <div className="flex-1"></div>
      <div className="flex items-center gap-gutter">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200">
          <span className="material-symbols-outlined text-lg">notifications</span>
        </button>
        <div className="flex items-center gap-3 border-l border-outline-variant/20 pl-gutter">
          <span className="font-label-md text-label-md text-on-surface-variant">Support</span>
          <div className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container transition-colors duration-200 py-1 pl-1 pr-3 rounded-full cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
              {initial}
            </div>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">{displayName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
