'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/settings');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Check if user is admin
  const userRole = (session?.user as any)?.role;
  if (status === 'authenticated' && userRole !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-red-600 dark:text-red-400">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าหน้านี้ได้</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
            ← กลับหน้า Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const settingsMenu = [
    {
      title: 'จัดการผู้ใช้',
      description: 'เพิ่ม แก้ไข ลบ ผู้ใช้งานระบบ',
      icon: '👥',
      href: '/settings/users',
      color: 'bg-primary-bg hover:bg-primary/20'
    },
    {
      title: 'จัดการจังหวัด',
      description: 'จัดการข้อมูลจังหวัดและภูมิภาค',
      icon: '🗺️',
      href: '/settings/provinces',
      color: 'bg-secondary-bg hover:bg-secondary/20'
    },
    {
      title: 'จัดการประเภทสถานบริการ',
      description: 'จัดการประเภทโรงพยาบาล (รพ., รพ.สต., รพช.)',
      icon: '🏨',
      href: '/settings/facility-types',
      color: 'bg-accent-bg hover:bg-accent/20'
    },
    {
      title: 'จัดการหมวดยา',
      description: 'จัดการหมวดหมู่ของยา',
      icon: '💊',
      href: '/settings/drug-categories',
      color: 'bg-tertiary-bg hover:bg-tertiary/20'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">⚙️ ตั้งค่าระบบ</h1>
        <p className="text-secondary mt-2">จัดการการตั้งค่าและข้อมูลพื้นฐานของระบบ</p>
      </div>

      {/* Admin Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl shadow p-6 transition-colors ${item.color}`}
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">{item.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}