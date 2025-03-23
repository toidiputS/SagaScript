
import React from 'react';
import { NextPage } from 'next';
import HelpCenter from '@/components/help/help-center';
import Layout from '@/components/layout/layout';

const HelpPage: NextPage = () => {
  return (
    <Layout>
      <HelpCenter />
    </Layout>
  );
};

export default HelpPage;
