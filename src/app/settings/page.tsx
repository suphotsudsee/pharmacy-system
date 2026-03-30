'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'
    },
    {
      title: 'จัดการจังหวัด',
      description: 'จัดการข้อมูลจังหวัดและภูมิภาค',
      icon: '🗺️',
      href: '/settings/provinces',
      color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50'
    },
    {
      title: 'จัดการประเภทสถานบริการ',
      description: 'จัดการประเภทโรงพยาบาล (รพ., รพ.สต., รพช.)',
      icon: '🏨',
      href: '/settings/facility-types',
      color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50'
    },
    {
      title: 'จัดการหมวดยา',
      description: 'จัดการหมวดหมู่ของยา',
      icon: '💊',
      href: '/settings/drug-categories',
      color: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50'
    },
  ];

  // Theme Settings Component
  const ThemeSettings = () => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
      setMounted(true);
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      } else {
        setCurrentTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
    }, []);

    const handleThemeChange = (theme: 'light' | 'dark') => {
      setCurrentTheme(theme);
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    if (!mounted) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">🎨 ธีมการแสดงผล</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">เลือกธีมที่คุณต้องการใช้งาน</p>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Light Mode */}
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentTheme === 'light'
                ? 'border-primary bg-primary-bg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-2">☀️</div>
            <div className="font-semibold dark:text-white">Light Mode</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">โหมดสว่าง</div>
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentTheme === 'dark'
                ? 'border-primary bg-primary-bg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-2">🌙</div>
            <div className="font-semibold dark:text-white">Dark Mode</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">โหมดมืด</div>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          💡 คุณสามารถสลับธีมได้อย่างรวดเร็วจากปุ่มในแถบนำทางด้านบน
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">⚙️ ตั้งค่าระบบ</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">จัดการการตั้งค่าและข้อมูลพื้นฐานของระบบ</p>
      </div>

      {/* Theme Settings */}
      <div className="mb-8">
        <ThemeSettings />
      </div>

      {/* Admin Settings */}
      <h2 className="text-xl font-bold mb-4 dark:text-white">🔐 การตั้งค่าผู้ดูแลระบบ</h2>
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