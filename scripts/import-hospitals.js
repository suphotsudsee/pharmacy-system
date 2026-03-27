const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

async function importData() {
  console.log('📊 เริ่มนำเข้าข้อมูลจาก Excel...\n');
  
  // อ่านไฟล์ Excel - ลองหลายที่
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'OneStockOneRegion.xlsx'),
    path.join(__dirname, '..', 'OneStockOneRegion.xlsx'),
    'C:\\fullstack\\drugstoreubon\\OneStockOneRegion.xlsx'
  ];
  
  let excelPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      excelPath = p;
      break;
    }
  }
  
  if (!excelPath) {
    console.error('❌ ไม่พบไฟล์ Excel ในที่ใดก็ตามนี้:');
    possiblePaths.forEach(p => console.error('  -', p));
    process.exit(1);
  }
  
  console.log('📁 ไฟล์:', excelPath);
  
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });
  
  console.log(`📋 พบข้อมูล ${data.length} แถว\n`);
  
  // แสดง headers
  console.log('📋 Headers:', Object.keys(data[0]).filter(k => k).join(', '));
  console.log('');
  
  // สร้างไฟล์ JSON สำหรับ import
  const hospitals = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // หาคอลัมน์ที่เป็นไปได้
    const hospCode = row['Hosp_Code'] || row['รหัส'] || row['code'] || row['EA'];
    const name = row['Hosp_Name'] || row['ชื่อ'] || row['name'] || row['โรงพยาบาล'];
    const shortName = row['short_name'] || row['ชื่อย่อ'] || row['ย่อ'] || null;
    const googleSheetLink = row['link ดาวน์โหลด'] || row['link'] || row['ลิงก์'] || row['googleSheet'] || null;
    const typeName = row['ประเภทสถานบริการ'] || row['type'] || row['ประเภท'] || 'รพ.สต.';
    
    if (hospCode && name) {
      hospitals.push({
        hospCode: String(hospCode).trim(),
        name: String(name).trim(),
        shortName: shortName ? String(shortName).trim() : null,
        googleSheetLink: googleSheetLink ? String(googleSheetLink).trim() : null,
        facilityType: String(typeName).trim()
      });
    }
  }
  
  console.log(`🏥 พบโรงพยาบาล ${hospitals.length} แห่ง\n`);
  
  // แสดงตัวอย่าง 5 แห่งแรก
  console.log('📋 ตัวอย่างข้อมูล:');
  hospitals.slice(0, 5).forEach((h, i) => {
    console.log(`  ${i + 1}. ${h.hospCode}: ${h.name}`);
    console.log(`     ประเภท: ${h.facilityType}`);
  });
  console.log('');
  
  // สร้างไฟล์ JSON
  const outputPath = path.join(__dirname, 'hospitals-import.json');
  fs.writeFileSync(outputPath, JSON.stringify(hospitals, null, 2));
  console.log(`✅ บันทึกไฟล์ JSON ไว้ที่: ${outputPath}\n`);
  
  // สรุปประเภทสถานบริการ
  const types = {};
  hospitals.forEach(h => {
    types[h.facilityType] = (types[h.facilityType] || 0) + 1;
  });
  
  console.log('📊 สรุปตามประเภทสถานบริการ:');
  Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} แห่ง`);
    });
  
  console.log('\n✨ พร้อมสำหรับการนำเข้า!');
  console.log('เข้าไปที่ http://localhost:9401/import เพื่อนำเข้าข้อมูล');
}

importData().catch(console.error);
