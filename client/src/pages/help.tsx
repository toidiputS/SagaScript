
import React from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/main-layout';
import HelpCenter from '@/components/help/help-center';

export default function HelpPage() {
  return (
    <>
      <Head>
        <title>Help & Support - Saga Scribe</title>
        <meta name="description" content="Find answers, guides, and support for using Saga Scribe" />
      </Head>
      <MainLayout>
        <HelpCenter />
      </MainLayout>
    </>
  );
}
