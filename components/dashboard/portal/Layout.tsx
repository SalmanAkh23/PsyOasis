import React from 'react';
import PortalSidebar from './Sidebar';
import PortalTopbar from './Topbar';
import Head from 'next/head';

interface Props {
  children: React.ReactNode;
  title?: string;
  doctorName?: string;
}

export default function PortalLayout({ children, title, doctorName }: Props) {
  return (
    <>
      <Head>
        <title>{title ? `${title} – PsyOasis Clinician Portal` : 'PsyOasis Clinician Portal'}</title>
        <meta name="description" content="PsyOasis Clinician Portal - Doctor Dashboard" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-surface text-on-surface font-body-md antialiased h-screen overflow-hidden flex">
        <PortalSidebar />
        <main className="ml-64 w-[calc(100%-256px)] h-screen overflow-y-auto bg-surface relative flex flex-col">
          <PortalTopbar doctorName={doctorName} />
          <div className="p-margin-desktop flex flex-col gap-stack-lg max-w-container-max mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
