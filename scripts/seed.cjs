const { PrismaClient } = require('../prisma/.prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')

const adapter = new PrismaLibSql({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...\n')

  // 1. Create Provinces
  console.log('📍 Creating provinces...')
  const provinceUB = await prisma.province.upsert({
    where: { code: 'UB' },
    update: { name: 'อุบลราชธานี', region: 'อีสาน' },
    create: { code: 'UB', name: 'อุบลราชธานี', region: 'อีสาน' }
  })
  const provinceBKK = await prisma.province.upsert({
    where: { code: '10' },
    update: { name: 'กรุงเทพมหานคร', region: 'กลาง' },
    create: { code: '10', name: 'กรุงเทพมหานคร', region: 'กลาง' }
  })
  const provinceCM = await prisma.province.upsert({
    where: { code: '50' },
    update: { name: 'เชียงใหม่', region: 'เหนือ' },
    create: { code: '50', name: 'เชียงใหม่', region: 'เหนือ' }
  })
  const provinceNS = await prisma.province.upsert({
    where: { code: '80' },
    update: { name: 'นครศรีธรรมราช', region: 'ใต้' },
    create: { code: '80', name: 'นครศรีธรรมราช', region: 'ใต้' }
  })
  console.log('   ✓ Created 4 provinces\n')

  // 2. Create Facility Types
  console.log('🏥 Creating facility types...')
  const ftHosp = await prisma.facilityType.upsert({
    where: { code: 'รพ.' },
    update: { name: 'โรงพยาบาล' },
    create: { code: 'รพ.', name: 'โรงพยาบาล', description: 'โรงพยาบาลทั่วไป' }
  })
  const ftRohSat = await prisma.facilityType.upsert({
    where: { code: 'รพ.สต.' },
    update: { name: 'โรงพยาบาลส่งเสริมสุขภาพตำบล' },
    create: { code: 'รพ.สต.', name: 'โรงพยาบาลส่งเสริมสุขภาพตำบล', description: 'รพ.สต.' }
  })
  const ftRohChum = await prisma.facilityType.upsert({
    where: { code: 'รพช.' },
    update: { name: 'โรงพยาบาลชุมชน' },
    create: { code: 'รพช.', name: 'โรงพยาบาลชุมชน', description: 'โรงพยาบาลชุมชน' }
  })
  console.log('   ✓ Created 3 facility types\n')

  // 3. Create Drug Categories
  console.log('💊 Creating drug categories...')
  const catAntibiotic = await prisma.drugCategory.upsert({
    where: { code: 'ANT' },
    update: { name: 'ยาปฏิชีวนะ' },
    create: { code: 'ANT', name: 'ยาปฏิชีวนะ' }
  })
  const catPain = await prisma.drugCategory.upsert({
    where: { code: 'PAIN' },
    update: { name: 'ยาแก้ปวด' },
    create: { code: 'PAIN', name: 'ยาแก้ปวด' }
  })
  const catCold = await prisma.drugCategory.upsert({
    where: { code: 'COLD' },
    update: { name: 'ยาแก้ไอ/หวัด' },
    create: { code: 'COLD', name: 'ยาแก้ไอ/หวัด' }
  })
  const catVit = await prisma.drugCategory.upsert({
    where: { code: 'VIT' },
    update: { name: 'วิตามิน/อาหารเสริม' },
    create: { code: 'VIT', name: 'วิตามิน/อาหารเสริม' }
  })
  const catDerm = await prisma.drugCategory.upsert({
    where: { code: 'DERM' },
    update: { name: 'ยาภายนอก' },
    create: { code: 'DERM', name: 'ยาภายนอก' }
  })
  const catInj = await prisma.drugCategory.upsert({
    where: { code: 'INJ' },
    update: { name: 'ยาฉีด' },
    create: { code: 'INJ', name: 'ยาฉีด' }
  })
  console.log('   ✓ Created 6 drug categories\n')

  // 4. Create Sample Drugs
  console.log('💉 Creating sample drugs...')
  const drugs = [
    { drugCode: 'PCT500', name: 'พาราเซตามอล 500 มก.', genericName: 'Paracetamol', categoryId: catPain.id, dosageForm: 'เม็ด', strength: '500 mg', unit: 'เม็ด', minStock: 100, maxStock: 5000, reorderPoint: 500, unitPrice: 0.5 },
    { drugCode: 'IBP400', name: 'ไอบูโพรเฟน 400 มก.', genericName: 'Ibuprofen', categoryId: catPain.id, dosageForm: 'เม็ด', strength: '400 mg', unit: 'เม็ด', minStock: 50, maxStock: 2000, reorderPoint: 200, unitPrice: 1.2 },
    { drugCode: 'AMX500', name: 'อะม็อกซีซิลลิน 500 มก.', genericName: 'Amoxicillin', categoryId: catAntibiotic.id, dosageForm: 'แคปซูล', strength: '500 mg', unit: 'แคปซูล', minStock: 100, maxStock: 3000, reorderPoint: 300, unitPrice: 2.5 },
    { drugCode: 'CTM4', name: 'คลอเฟนิรามีน 4 มก.', genericName: 'Chlorpheniramine', categoryId: catCold.id, dosageForm: 'เม็ด', strength: '4 mg', unit: 'เม็ด', minStock: 200, maxStock: 10000, reorderPoint: 1000, unitPrice: 0.3 },
    { drugCode: 'VITC', name: 'วิตามินซี 1000 มก.', genericName: 'Ascorbic Acid', categoryId: catVit.id, dosageForm: 'เม็ด', strength: '1000 mg', unit: 'เม็ด', minStock: 50, maxStock: 2000, reorderPoint: 200, unitPrice: 1.5 },
    { drugCode: 'OMZ20', name: 'โอเมพราโซล 20 มก.', genericName: 'Omeprazole', categoryId: catAntibiotic.id, dosageForm: 'แคปซูล', strength: '20 mg', unit: 'แคปซูล', minStock: 100, maxStock: 2000, reorderPoint: 200, unitPrice: 3.0 },
    { drugCode: 'MTP500', name: 'เมทรีนาโซล 500 มก.', genericName: 'Metronidazole', categoryId: catAntibiotic.id, dosageForm: 'เม็ด', strength: '500 mg', unit: 'เม็ด', minStock: 50, maxStock: 1500, reorderPoint: 150, unitPrice: 1.8 },
    { drugCode: 'BETC', name: 'เบตาเมทาโซน ครีม', genericName: 'Betamethasone', categoryId: catDerm.id, dosageForm: 'ครีม', strength: '0.1%', unit: 'หลอด', minStock: 20, maxStock: 500, reorderPoint: 50, unitPrice: 25.0 },
    { drugCode: 'DCP75', name: 'ไดโคลฟีแนค 75 มก./3 มล.', genericName: 'Diclofenac', categoryId: catInj.id, dosageForm: 'ฉีด', strength: '75 mg/3ml', unit: 'หลอด', minStock: 10, maxStock: 200, reorderPoint: 30, unitPrice: 35.0 },
    { drugCode: 'CPR7', name: 'เซฟไตรอะโซน 1 ก.', genericName: 'Ceftriaxone', categoryId: catInj.id, dosageForm: 'ฉีด', strength: '1 g', unit: 'ขวด', minStock: 20, maxStock: 300, reorderPoint: 50, unitPrice: 80.0 },
  ]

  for (const drug of drugs) {
    await prisma.drug.upsert({
      where: { drugCode: drug.drugCode },
      update: drug,
      create: drug
    })
  }
  console.log('   ✓ Created 10 sample drugs\n')

  // 5. Create Sample Hospitals
  console.log('🏥 Creating sample hospitals...')
  const sampleHospitals = [
    { hospCode: 'EA0010669', name: 'โรงพยาบาลสรรพสิทธิประสงค์', shortName: 'รพ.สรรพสิทธิประสงค์', provinceId: provinceUB.id, facilityTypeId: ftHosp.id },
    { hospCode: 'EA0010954', name: 'โรงพยาบาลวารินชำราบ', shortName: 'รพ.วารินชำราบ', provinceId: provinceUB.id, facilityTypeId: ftHosp.id },
    { hospCode: 'EA0021984', name: 'โรงพยาบาล 50 พรรษา มหาวชิราลงกรณ', shortName: 'รพ.50 พรรษา', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0011443', name: 'โรงพยาบาลสมเด็จพระยุพราชเดชอุดม', shortName: 'รพ.สมเด็จพระยุพราช', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0010951', name: 'โรงพยาบาลตระการพืชผล', shortName: 'รพ.ตระการพืชผล', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0024032', name: 'โรงพยาบาลนาเยีย', shortName: 'รพ.นาเยีย', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0027976', name: 'โรงพยาบาลนาสวน', shortName: 'รพ.นาสวน', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0027967', name: 'โรงพยาบาลเขื่อนใหญ่', shortName: 'รพ.เขื่อนใหญ่', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0027968', name: 'โรงพยาบาลโขงเจียง', shortName: 'รพ.โขงเจียง', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    { hospCode: 'EA0024821', name: 'โรงพยาบาลโนนอุดม', shortName: 'รพ.โนนอุดม', provinceId: provinceUB.id, facilityTypeId: ftRohChum.id },
    // Bangkok hospitals
    { hospCode: 'H001', name: 'โรงพยาบาลศิริราช', shortName: 'รพ.ศิริราช', provinceId: provinceBKK.id, facilityTypeId: ftHosp.id },
    { hospCode: 'H002', name: 'โรงพยาบาลรามาธิบดี', shortName: 'รพ.รามาธิบดี', provinceId: provinceBKK.id, facilityTypeId: ftHosp.id },
    { hospCode: 'H003', name: 'โรงพยาบาลจุฬาลงกรณ์', shortName: 'รพ.จุฬา', provinceId: provinceBKK.id, facilityTypeId: ftHosp.id },
    // Chiang Mai
    { hospCode: 'CM001', name: 'โรงพยาบาลมหาราชนครเชียงใหม่', shortName: 'รพ.มหาราช', provinceId: provinceCM.id, facilityTypeId: ftHosp.id },
    // Nakhon Si Thammarat
    { hospCode: 'NS001', name: 'โรงพยาบาลมหาราชนครศรีธรรมราช', shortName: 'รพ.มหาราช นครศรีฯ', provinceId: provinceNS.id, facilityTypeId: ftHosp.id },
  ]

  for (const hosp of sampleHospitals) {
    await prisma.hospital.upsert({
      where: { hospCode: hosp.hospCode },
      update: hosp,
      create: hosp
    })
  }
  console.log('   ✓ Created 16 hospitals\n')

  // 6. Create sample inventory
  console.log('📦 Creating sample inventory...')
  const allDrugs = await prisma.drug.findMany()
  const allHospitals = await prisma.hospital.findMany()
  
  for (const hospital of allHospitals.slice(0, 5)) {
    for (const drug of allDrugs.slice(0, 5)) {
      const existing = await prisma.drugInventory.findFirst({
        where: { hospitalId: hospital.id, drugId: drug.id }
      })
      if (!existing) {
        await prisma.drugInventory.create({
          data: {
            hospitalId: hospital.id,
            drugId: drug.id,
            currentStock: Math.floor(Math.random() * 500) + 50,
            availableStock: Math.floor(Math.random() * 500) + 50,
            reservedStock: 0,
            location: `ชั้น ${Math.floor(Math.random() * 3) + 1}`,
            expiryDate: new Date(Date.now() + (Math.random() * 365 + 180) * 24 * 60 * 60 * 1000)
          }
        })
      }
    }
  }
  console.log('   ✓ Created sample inventory\n')

  // 7. Create sample drug requests
  console.log('📝 Creating sample drug requests...')
  const firstHospital = allHospitals[0]
  const firstDrug = allDrugs[0]
  
  if (firstHospital && firstDrug) {
    await prisma.drugRequest.create({
      data: {
        requestNumber: 'REQ-2026-000001',
        hospitalId: firstHospital.id,
        status: 'PENDING',
        requestedBy: 'เจ้าหน้าที่ทดสอบ',
        notes: 'ใบเบิกยาตัวอย่าง',
        items: {
          create: [
            { drugId: firstDrug.id, quantity: 100 },
            { drugId: allDrugs[1]?.id || firstDrug.id, quantity: 50 }
          ]
        }
      }
    })
    console.log('   ✓ Created sample drug request\n')
  }

  // Summary
  console.log('✨ Seeding completed!\n')
  console.log('📊 Summary:')
  console.log(`   - Provinces: ${await prisma.province.count()}`)
  console.log(`   - Facility Types: ${await prisma.facilityType.count()}`)
  console.log(`   - Drug Categories: ${await prisma.drugCategory.count()}`)
  console.log(`   - Drugs: ${await prisma.drug.count()}`)
  console.log(`   - Hospitals: ${await prisma.hospital.count()}`)
  console.log(`   - Inventory Items: ${await prisma.drugInventory.count()}`)
  console.log(`   - Drug Requests: ${await prisma.drugRequest.count()}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())