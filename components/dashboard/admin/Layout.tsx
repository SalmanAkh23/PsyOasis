import React from 'react';
import AdminSidebar from './Sidebar';
import AdminTopbar from './Topbar';
import Head from 'next/head';

interface Props {
  children: React.ReactNode;
  title?: string;
  secret: string;
  onNavigate?: (section: string) => void;
  activeSection?: string;
}

export default function AdminLayout({ children, title, secret, onNavigate, activeSection }: Props) {
  return (
    <>
      <Head>
        <title>{title ? `${title} – PsyOasis Admin` : 'PsyOasis Admin Console'}</title>
      </Head>
      <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex">
        <AdminSidebar secret={secret} onNavigate={onNavigate} activeSection={activeSection} />
        <main className="ml-64 w-full flex-1 flex flex-col min-h-screen">
          <AdminTopbar />
          <div className="pt-[calc(64px+32px)] px-margin-desktop pb-margin-desktop flex flex-col gap-stack-lg max-w-container-max mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
