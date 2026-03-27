import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/import/inventory - Import inventory from JSON/Excel
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Import from Excel file
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'กรุณาเลือกไฟล์' },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const xlsx = await import('xlsx')
      const workbook = xlsx.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = xlsx.utils.sheet_to_json(worksheet, { defval: null })

      return await importInventory(data)
    } else {
      // Import from JSON
      const body = await request.json()
      return await importInventory(body.inventory || body)
    }
  } catch (error) {
    console.error('Error importing inventory:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' },
      { status: 500 }
    )
  }
}

async function importInventory(data: any[]) {
  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[],
    warnings: [] as string[],
    hospitals: new Map<string, { id: number; name: string }>()
  }

  // ตรวจสอบว่ามีคอลัมน์ Hospital Code หรือไม่
  if (data.length > 0) {
    const firstRow = data[0]
    const hospCode = firstRow['Hosp_Code'] || firstRow['hospCode'] || firstRow['รหัสโรงพยาบาล'] || firstRow['hosp_code'] || firstRow['hospitalCode'] || firstRow['Hospital_Code']
    
    if (!hospCode) {
      return NextResponse.json({
        success: false,
        error: 'ไฟล์ต้องมีคอลัมน์รหัสโรงพยาบาล (Hosp_Code, hospCode, หรือ รหัสโรงพยาบาล)',
        hint: 'เพิ่มคอลัมน์ Hosp_Code ในไฟล์ Excel เพื่อระบุโรงพยาบาลของแต่ละรายการยา'
      }, { status: 400 })
    }
  }

  // ดึงโรงพยาบาลทั้งหมดมาเก็บไว้
  const hospitals = await prisma.hospital.findMany({
    where: { isActive: true },
    select: { id: true, hospCode: true, name: true }
  })
  
  for (const h of hospitals) {
    results.hospitals.set(h.hospCode, { id: h.id, name: h.name })
  }

  // ดึงยาทั้งหมดมาเก็บไว้
  const drugs = await prisma.drug.findMany({
    where: { isActive: true },
    select: { id: true, drugCode: true, name: true, unit: true }
  })
  
  const drugMap = new Map<string, typeof drugs[0]>()
  for (const d of drugs) {
    drugMap.set(d.drugCode, d)
  }

  // ประมวลผลแต่ละแถว
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // Excel row number (1-based + header)
    
    try {
      // อ่านข้อมูลจากคอลัมน์ต่างๆ
      const hospCode = row['Hosp_Code'] || row['hospCode'] || row['รหัสโรงพยาบาล'] || row['hosp_code'] || row['hospitalCode'] || row['Hospital_Code']
      const drugCode = row['drugCode'] || row['รหัสยา'] || row['drug_code'] || row['Code'] || row['Drug_Code']
      const drugName = row['drugName'] || row['ชื่อยา'] || row['drug_name'] || row['Name'] || row['Drug_Name']
      const quantity = parseInt(row['quantity'] || row['จำนวน'] || row['Quantity'] || row['Qty'] || row['Amount'] || 0)
      const lotNumber = row['lotNumber'] || row['หมายเลขล็อต'] || row['Lot'] || row['LotNumber'] || null
      const expiryDate = row['expiryDate'] || row['วันหมดอายุ'] || row['ExpiryDate'] || row['Expiry'] || row['Expiry_Date']
      const location = row['location'] || row['ที่เก็บ'] || row['Location'] || row['Shelf'] || null

      // ตรวจสอบข้อมูลจำเป็น
      if (!hospCode) {
        results.errors.push(`แถว ${rowNum}: ไม่พบรหัสโรงพยาบาล`)
        results.skipped++
        continue
      }

      if (!drugCode && !drugName) {
        results.errors.push(`แถว ${rowNum}: ไม่พบรหัสยาหรือชื่อยา`)
        results.skipped++
        continue
      }

      if (!quantity || quantity <= 0) {
        results.errors.push(`แถว ${rowNum}: จำนวนต้องมากกว่า 0`)
        results.skipped++
        continue
      }

      // หาโรงพยาบาล
      let hospital = results.hospitals.get(String(hospCode))
      if (!hospital) {
        // ลองหาใน database
        const dbHosp = await prisma.hospital.findUnique({
          where: { hospCode: String(hospCode) }
        })
        if (!dbHosp) {
          results.errors.push(`แถว ${rowNum}: ไม่พบโรงพยาบาลรหัส "${hospCode}"`)
          results.skipped++
          continue
        }
        hospital = { id: dbHosp.id, name: dbHosp.name }
        results.hospitals.set(dbHosp.hospCode, hospital)
      }

      // หายา
      let drug = drugMap.get(String(drugCode))
      if (!drug) {
        // ลองหาจากชื่อ
        drug = drugs.find(d => d.name.toLowerCase().includes(String(drugName).toLowerCase()))
        if (!drug) {
          results.errors.push(`แถว ${rowNum}: ไม่พบยา "${drugCode || drugName}"`)
          results.skipped++
          continue
        }
      }

      // แปลงวันหมดอายุ
      let expiry: Date | null = null
      if (expiryDate) {
        if (typeof expiryDate === 'number') {
          // Excel serial date
          const excelEpoch = new Date(1899, 11, 30)
          expiry = new Date(excelEpoch.getTime() + expiryDate * 86400000)
        } else if (typeof expiryDate === 'string') {
          expiry = new Date(expiryDate)
        }
      }

      // ตรวจสอบว่ามีสต็อกอยู่แล้วหรือไม่
      const existing = await prisma.drugInventory.findFirst({
        where: {
          hospitalId: hospital.id,
          drugId: drug.id,
          lotNumber: lotNumber || null
        }
      })

      if (existing) {
        // อัปเดต
        await prisma.drugInventory.update({
          where: { id: existing.id },
          data: {
            currentStock: existing.currentStock + quantity,
            availableStock: existing.availableStock + quantity,
            expiryDate: expiry || existing.expiryDate,
            location: location || existing.location,
            lastRestocked: new Date()
          }
        })
        
        // บันทึก transaction
        await prisma.drugTransaction.create({
          data: {
            hospitalId: hospital.id,
            drugId: drug.id,
            transactionType: 'RECEIPT',
            quantity: quantity,
            previousStock: existing.currentStock,
            newStock: existing.currentStock + quantity,
            lotNumber: lotNumber,
            notes: `นำเข้าจากไฟล์ Excel - แถว ${rowNum}`
          }
        })
        
        results.updated++
      } else {
        // สร้างใหม่
        await prisma.drugInventory.create({
          data: {
            hospitalId: hospital.id,
            drugId: drug.id,
            lotNumber: lotNumber,
            expiryDate: expiry,
            currentStock: quantity,
            reservedStock: 0,
            availableStock: quantity,
            location: location,
            lastRestocked: new Date()
          }
        })
        
        // บันทึก transaction
        await prisma.drugTransaction.create({
          data: {
            hospitalId: hospital.id,
            drugId: drug.id,
            transactionType: 'RECEIPT',
            quantity: quantity,
            previousStock: 0,
            newStock: quantity,
            lotNumber: lotNumber,
            notes: `นำเข้าจากไฟล์ Excel - แถว ${rowNum}`
          }
        })
        
        results.created++
      }
      
    } catch (err) {
      const error = err as Error
      results.errors.push(`แถว ${rowNum}: ${error.message}`)
      results.skipped++
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      total: data.length,
      created: results.created,
      updated: results.updated,
      skipped: results.skipped,
      errors: results.errors,
      warnings: results.warnings,
      hospitals: Array.from(results.hospitals.values())
    }
  })
}