import Link from 'next/link';

export default function SettingsPage() {
  const settingsMenu = [
    {
      title: 'จัดการผู้ใช้',
      description: 'เพิ่ม แก้ไข ลบ ผู้ใช้งานระบบ',
      icon: '👥',
      href: '/settings/users',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'จัดการจังหวัด',
      description: 'จัดการข้อมูลจังหวัดและภูมิภาค',
      icon: '🗺️',
      href: '/settings/provinces',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'จัดการประเภทสถานบริการ',
      description: 'จัดการประเภทโรงพยาบาล (รพ., รพ.สต., รพช.)',
      icon: '🏨',
      href: '/settings/facility-types',
      color: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'จัดการหมวดยา',
      description: 'จัดการหมวดหมู่ของยา',
      icon: '💊',
      href: '/settings/drug-categories',
      color: 'bg-orange-50 hover:bg-orange-100'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">⚙️ ตั้งค่าระบบ</h1>
        <p className="text-gray-600 mt-2">จัดการการตั้งค่าและข้อมูลพื้นฐานของระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl shadow p-6 transition-colors ${item.color}`}
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}