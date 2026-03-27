export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">🏥 ระบบคลังยา</h1>
        <p className="text-xl opacity-90 mb-6">
          ระบบจัดการคลังยาสำหรับโรงพยาบาลทุกแห่ง
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="/dashboard" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
            📊 Dashboard
          </a>
          <a href="/hospitals" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-400">
            🏨 ดูโรงพยาบาล
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-4xl mb-4">🏥</div>
          <h2 className="text-xl font-bold mb-2">จัดการโรงพยาบาล</h2>
          <p className="text-gray-600 mb-4">
            รองรับโรงพยาบาลทั่วประเทศ จัดกลุ่มตามจังหวัดและภูมิภาค
          </p>
          <a href="/hospitals" className="text-blue-600 hover:underline">ดูรายการ →</a>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-4xl mb-4">💊</div>
          <h2 className="text-xl font-bold mb-2">จัดการยา</h2>
          <p className="text-gray-600 mb-4">
            จัดการรายการยา หมวดหมู่ และข้อมูลการสั่งซื้อ
          </p>
          <a href="/drugs" className="text-blue-600 hover:underline">ดูรายการ →</a>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-2">คลังยา</h2>
          <p className="text-gray-600 mb-4">
            ติดตามสต็อกยา แจ้งเตือนยาใกล้หมด และยาใกล้หมดอายุ
          </p>
          <a href="/inventory" className="text-blue-600 hover:underline">ดูรายการ →</a>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold mb-2">ใบเบิกยา</h2>
          <p className="text-gray-600 mb-4">
            สร้างและติดตามใบเบิกยา อนุมัติและจัดส่ง
          </p>
          <a href="/requests" className="text-blue-600 hover:underline">ดูรายการ →</a>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-600 mb-4">
            สรุปสถิติ กราฟ และการแจ้งเตือน
          </p>
          <a href="/dashboard" className="text-blue-600 hover:underline">ดู Dashboard →</a>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="text-xl font-bold mb-2">ทั่วประเทศ</h2>
          <p className="text-gray-600 mb-4">
            รองรับโรงพยาบาลทุกภูมิภาคของประเทศไทย
          </p>
          <a href="/hospitals" className="text-blue-600 hover:underline">ดูแผนที่ →</a>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">📈 สถิติระบบ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-700">1,000+</div>
            <div className="text-gray-600">โรงพยาบาล</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-700">77</div>
            <div className="text-gray-600">จังหวัด</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-700">5</div>
            <div className="text-gray-600">ภูมิภาค</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-700">24/7</div>
            <div className="text-gray-600">บริการตลอดเวลา</div>
          </div>
        </div>
      </div>
    </div>
  );
}