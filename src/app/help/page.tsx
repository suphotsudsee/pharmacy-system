'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HelpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      question: 'วิธีเพิ่มรายการยาใหม่?',
      answer: 'ไปที่เมนู "รายการยา" > คลิกปุ่ม "เพิ่มยาใหม่" > กรอกข้อมูลยาให้ครบถ้วน > กดบันทึก'
    },
    {
      question: 'วิธีเบิกยาจากคลัง?',
      answer: 'ไปที่เมนู "ใบเบิกยา" > คลิก "สร้างใบเบิกใหม่" > เลือกรายการยาและจำนวน > กดส่งคำขอ'
    },
    {
      question: 'วิธีตรวจสอบยอดยาในคลัง?',
      answer: 'ไปที่เมนู "คลังยา" > เลือกรายการยาที่ต้องการดู > ระบบจะแสดงยอดคงเหลือและประวัติการเคลื่อนไหว'
    },
    {
      question: 'วิธีนำเข้าข้อมูลยาจาก Excel?',
      answer: 'ไปที่เมนู "นำเข้า" > เลือก "นำเข้าจาก Excel" > อัพโหลดไฟล์ > ตรวจสอบข้อมูล > กดนำเข้า'
    },
    {
      question: 'ลืมรหัสผ่านต้องทำอย่างไร?',
      answer: 'ติดต่อผู้ดูแลระบบ (ADMIN) เพื่อรีเซ็ตรหัสผ่าน'
    },
    {
      question: 'วิธีเปลี่ยนธีม (Dark/Light Mode)?',
      answer: 'คลิกปุ่ม Sun/Moon ที่มุมขวาบนของหน้าจอ หรือไปที่หน้า "ตั้งค่า" > "ธีมการแสดงผล"'
    },
  ];

  const guides = [
    {
      title: 'คู่มือผู้ใช้พื้นฐาน',
      description: 'การใช้งานระบบสำหรับผู้ใช้ทั่วไป',
      icon: '📖',
      href: '#'
    },
    {
      title: 'คู่มือผู้ดูแลระบบ',
      description: 'การจัดการผู้ใช้และการตั้งค่าระบบ',
      icon: '⚙️',
      href: '/settings'
    },
    {
      title: 'การนำเข้าข้อมูล',
      description: 'วิธีการนำเข้าข้อมูลจาก Excel',
      icon: '📥',
      href: '/import'
    },
    {
      title: 'การเบิกยา',
      description: 'ขั้นตอนการเบิกยาจากคลัง',
      icon: '📝',
      href: '/requests'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
          ← กลับหน้า Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📚 คู่มือการใช้งาน</h1>
        <p className="text-gray-600 dark:text-gray-300">
          คู่มือและคำถามที่พบบ่อยสำหรับระบบคลังยา
        </p>
      </div>

      {/* Quick Guides */}
      <section className="mb-10">
        <h2 className="text-xl font-bold dark:text-white mb-4">📖 คู่มือแนะนำ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide, index) => (
            <Link
              key={index}
              href={guide.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2">{guide.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{guide.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">❓ คำถามที่พบบ่อย</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
            >
              <summary className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💬</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">ต้องการความช่วยเหลือเพิ่มเติม?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              หากไม่พบคำตอบในคู่มือนี้ สามารถติดต่อทีมสนับสนุนได้
            </p>
            <Link href="/support" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              ติดต่อสนับสนุน
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
