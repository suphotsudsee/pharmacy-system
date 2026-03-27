import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/seed - Seed database with sample data
export async function POST() {
  try {
    const results = {
      provinces: 0,
      facilityTypes: 0,
      drugCategories: 0,
      drugs: 0,
      hospitals: 0,
      inventory: 0,
      requests: 0
    }

    // 1. Create Provinces
    const provinces = [
      { code: 'UB', name: 'อุบลราชธานี', region: 'อีสาน' },
      { code: '10', name: 'กรุงเทพมหานคร', region: 'กลาง' },
      { code: '50', name: 'เชียงใหม่', region: 'เหนือ' },
      { code: '80', name: 'นครศรีธรรมราช', region: 'ใต้' },
    ]
    
    for (const p of provinces) {
      await prisma.province.upsert({
        where: { code: p.code },
        update: p,
        create: p
      })
      results.provinces++
    }

    // 2. Create Facility Types
    const facilityTypes = [
      { code: 'รพ.', name: 'โรงพยาบาล', description: 'โรงพยาบาลทั่วไป' },
      { code: 'รพ.สต.', name: 'โรงพยาบาลส่งเสริมสุขภาพตำบล', description: 'รพ.สต.' },
      { code: 'รพช.', name: 'โรงพยาบาลชุมชน', description: 'โรงพยาบาลชุมชน' },
    ]
    
    for (const ft of facilityTypes) {
      await prisma.facilityType.upsert({
        where: { code: ft.code },
        update: ft,
        create: ft
      })
      results.facilityTypes++
    }

    // 3. Create Drug Categories
    const drugCategories = [
      { code: 'ANT', name: 'ยาปฏิชีวนะ' },
      { code: 'PAIN', name: 'ยาแก้ปวด' },
      { code: 'COLD', name: 'ยาแก้ไอ/หวัด' },
      { code: 'VIT', name: 'วิตามิน/อาหารเสริม' },
      { code: 'DERM', name: 'ยาภายนอก' },
      { code: 'INJ', name: 'ยาฉีด' },
    ]
    
    for (const dc of drugCategories) {
      await prisma.drugCategory.upsert({
        where: { code: dc.code },
        update: dc,
        create: dc
      })
      results.drugCategories++
    }

    // 4. Create Drugs
    const categoryPain = await prisma.drugCategory.findUnique({ where: { code: 'PAIN' } })
    const categoryAnt = await prisma.drugCategory.findUnique({ where: { code: 'ANT' } })
    const categoryCold = await prisma.drugCategory.findUnique({ where: { code: 'COLD' } })
    const categoryVit = await prisma.drugCategory.findUnique({ where: { code: 'VIT' } })
    const categoryDerm = await prisma.drugCategory.findUnique({ where: { code: 'DERM' } })
    const categoryInj = await prisma.drugCategory.findUnique({ where: { code: 'INJ' } })

    const drugs = [
      { drugCode: 'PCT500', name: 'พาราเซตามอล 500 มก.', genericName: 'Paracetamol', categoryId: categoryPain?.id, dosageForm: 'เม็ด', strength: '500 mg', unit: 'เม็ด', minStock: 100, maxStock: 5000, reorderPoint: 500, unitPrice: 0.5 },
      { drugCode: 'IBP400', name: 'ไอบูโพรเฟน 400 มก.', genericName: 'Ibuprofen', categoryId: categoryPain?.id, dosageForm: 'เม็ด', strength: '400 mg', unit: 'เม็ด', minStock: 50, maxStock: 2000, reorderPoint: 200, unitPrice: 1.2 },
      { drugCode: 'AMX500', name: 'อะม็อกซีซิลลิน 500 มก.', genericName: 'Amoxicillin', categoryId: categoryAnt?.id, dosageForm: 'แคปซูล', strength: '500 mg', unit: 'แคปซูล', minStock: 100, maxStock: 3000, reorderPoint: 300, unitPrice: 2.5 },
      { drugCode: 'CTM4', name: 'คลอเฟนิรามีน 4 มก.', genericName: 'Chlorpheniramine', categoryId: categoryCold?.id, dosageForm: 'เม็ด', strength: '4 mg', unit: 'เม็ด', minStock: 200, maxStock: 10000, reorderPoint: 1000, unitPrice: 0.3 },
      { drugCode: 'VITC', name: 'วิตามินซี 1000 มก.', genericName: 'Ascorbic Acid', categoryId: categoryVit?.id, dosageForm: 'เม็ด', strength: '1000 mg', unit: 'เม็ด', minStock: 50, maxStock: 2000, reorderPoint: 200, unitPrice: 1.5 },
      { drugCode: 'OMZ20', name: 'โอเมพราโซล 20 มก.', genericName: 'Omeprazole', categoryId: categoryAnt?.id, dosageForm: 'แคปซูล', strength: '20 mg', unit: 'แคปซูล', minStock: 100, maxStock: 2000, reorderPoint: 200, unitPrice: 3.0 },
      { drugCode: 'BETC', name: 'เบตาเมทาโซน ครีม', genericName: 'Betamethasone', categoryId: categoryDerm?.id, dosageForm: 'ครีม', strength: '0.1%', unit: 'หลอด', minStock: 20, maxStock: 500, reorderPoint: 50, unitPrice: 25.0 },
      { drugCode: 'DCP75', name: 'ไดโคลฟีแนค 75 มก.', genericName: 'Diclofenac', categoryId: categoryInj?.id, dosageForm: 'ฉีด', strength: '75 mg/3ml', unit: 'หลอด', minStock: 10, maxStock: 200, reorderPoint: 30, unitPrice: 35.0 },
    ]

    for (const drug of drugs) {
      if (drug.categoryId) {
        await prisma.drug.upsert({
          where: { drugCode: drug.drugCode },
          update: drug,
          create: drug
        })
        results.drugs++
      }
    }

    // 5. Create Hospitals
    const provinceUB = await prisma.province.findUnique({ where: { code: 'UB' } })
    const provinceBKK = await prisma.province.findUnique({ where: { code: '10' } })
    const ftHosp = await prisma.facilityType.findUnique({ where: { code: 'รพ.' } })
    const ftRohChum = await prisma.facilityType.findUnique({ where: { code: 'รพช.' } })

    const hospitals = [
      { hospCode: 'EA0010669', name: 'โรงพยาบาลสรรพสิทธิประสงค์', shortName: 'รพ.สรรพสิทธิประสงค์', provinceId: provinceUB?.id, facilityTypeId: ftHosp?.id },
      { hospCode: 'EA0010954', name: 'โรงพยาบาลวารินชำราบ', shortName: 'รพ.วารินชำราบ', provinceId: provinceUB?.id, facilityTypeId: ftHosp?.id },
      { hospCode: 'EA0021984', name: 'โรงพยาบาล 50 พรรษา', shortName: 'รพ.50 พรรษา', provinceId: provinceUB?.id, facilityTypeId: ftRohChum?.id },
      { hospCode: 'H001', name: 'โรงพยาบาลศิริราช', shortName: 'รพ.ศิริราช', provinceId: provinceBKK?.id, facilityTypeId: ftHosp?.id },
      { hospCode: 'H002', name: 'โรงพยาบาลรามาธิบดี', shortName: 'รพ.รามาธิบดี', provinceId: provinceBKK?.id, facilityTypeId: ftHosp?.id },
    ]

    for (const hosp of hospitals) {
      if (hosp.provinceId && hosp.facilityTypeId) {
        await prisma.hospital.upsert({
          where: { hospCode: hosp.hospCode },
          update: hosp,
          create: hosp
        })
        results.hospitals++
      }
    }

    // 6. Create sample inventory
    const allHospitals = await prisma.hospital.findMany()
    const allDrugs = await prisma.drug.findMany()

    for (const hospital of allHospitals.slice(0, 3)) {
      for (const drug of allDrugs.slice(0, 5)) {
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
        results.inventory++
      }
    }

    // 7. Create sample request
    if (allHospitals.length > 0 && allDrugs.length > 0) {
      await prisma.drugRequest.create({
        data: {
          requestNumber: 'REQ-2026-000001',
          hospitalId: allHospitals[0].id,
          status: 'PENDING',
          requestedBy: 'เจ้าหน้าที่ทดสอบ',
          notes: 'ใบเบิกยาตัวอย่าง',
          items: {
            create: [
              { drugId: allDrugs[0].id, quantity: 100 },
              { drugId: allDrugs[1]?.id || allDrugs[0].id, quantity: 50 }
            ]
          }
        }
      })
      results.requests++
    }

    return NextResponse.json({
      success: true,
      message: 'Seeded database successfully',
      results
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}