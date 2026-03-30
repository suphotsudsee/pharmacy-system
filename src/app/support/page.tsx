'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SupportPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'technical',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'technical', label: 'ปัญหาทางเทคนิค', icon: '🔧' },
    { value: 'account', label: 'บัญชีผู้ใช้', icon: '👤' },
    { value: 'feature', label: 'แนะนำฟีเจอร์', icon: '💡' },
    { value: 'other', label: 'อื่นๆ', icon: '📝' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
          ← กลับหน้า Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">💬 ติดต่อสนับสนุน</h1>
        <p className="text-gray-600 dark:text-gray-300">
          ส่งคำถามหรือปัญหาของคุณมา เราจะตอบกลับโดยเร็วที่สุด
        </p>
      </div>

      {submitted ? (
        /* Success Message */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ส่งคำขอเรียบร้อยแล้ว</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            เราจะติดต่อกลับทางอีเมลภายใน 24-48 ชั่วโมง
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            กลับหน้า Dashboard
          </Link>
        </div>
      ) : (
        /* Support Form */
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ประเภทปัญหา</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">หัวข้อ</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="สรุปปัญหาสั้นๆ"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">รายละเอียด</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อธิบายปัญหาหรือคำถามของคุณอย่างละเอียด"
            />
          </div>

          <button type="submit" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            ส่งคำขอ
          </button>
        </form>
      )}

      {/* Contact Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📧</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">อีเมล</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                support@pharmacy-system.com
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📞</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">โทรศัพท์</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                02-XXX-XXXX (จ-ศ 08:00-17:00)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">กรณีฉุกเฉิน</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              หากเกิดปัญหาเร่งด่วนที่กระทบการใช้งาน กรุณาติดต่อผู้ดูแลระบบโดยตรง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
