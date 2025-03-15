'use client';

import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';

export const ClientAnalytics = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      // Client tarafında olduğumuzdan emin olalım
      setIsMounted(true);
    } catch (error) {
      console.error('Analytics mount error:', error);
    }

    return () => {
      // Cleanup
      setIsMounted(false);
    };
  }, []);

  // Sadece client tarafında render et
  if (!isMounted) {
    return null;
  }

  try {
    return <Analytics />;
  } catch (error) {
    console.error('Analytics render error:', error);
    return null;
  }
};

export default ClientAnalytics; 