'use client';

import { inject } from '@vercel/analytics';
import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';

const ClientAnalytics: React.FC = () => {
  useEffect(() => {
    // Analytics'i yükle
    inject();
    
    // Feature flags - basit bir yerel yönetim kullanacağız
    // Vercel feature flags olmadığı için yerel alternatifleri kullanıyoruz
    window.APP_FLAGS = {
      'smart-cooldown': true,
      'batch-translation': true,
      'progressive-translation': true,
      'aggressive-caching': true
    };
    
    console.log('✅ Vercel Analytics yüklendi');
  }, []);
  
  return <Analytics />;
};

export default ClientAnalytics; 