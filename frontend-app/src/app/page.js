'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="page-content">
      <div className="loading-message">
        <p>로딩 중...</p>
      </div>
    </div>
  );
}
