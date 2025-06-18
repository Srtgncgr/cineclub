'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Admin yetkisi kontrolü
  useEffect(() => {
    if (status === 'loading') return; // Auth durumu yükleniyor

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Yetki kontrolü sırasında yükleme ekranı göster
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Admin değilse hiçbir şey gösterme (zaten yönlendirildik)
  if (status !== 'authenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
} 