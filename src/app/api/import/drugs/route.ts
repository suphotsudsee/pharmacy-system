import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/import/drugs - Import drugs from JSON/Excel
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

      return await importDrugs(data)
    } else {
      // Import from JSON
      const body = await request.json()
      return await importDrugs(Array.isArray(body) ? body : body.drugs)
    }
  } catch (error) {
    console.error('Error importing drugs:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' },
      { status: 500 }
    )
  }
}

async function importDrugs(data: any[]) {
  // Ensure drug categories exist
  const categories = await ensureDrugCategories()
  const categoryMap: Record<string, number> = {}
  for (const cat of categories) {
    categoryMap[cat.code] = cat.id
    categoryMap[cat.name] = cat.id
  }

  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[]
  }

  for (const row of data) {
    try {
      // Normalize field names
      const drugCode = row.drugCode || row['รหัสยา'] || row['drug_code'] || row.code || row.Code
      const name = row.name || row['ชื่อยา'] || row['drug_name'] || row.DrugName || row.Name
      const genericName = row.genericName || row['ชื่อสามัญ'] || row['generic_name'] || row.GenericName
      const categoryName = row.category || row['หมวดยา'] || row['drug_category'] || row.Category || 'อื่นๆ'
      const dosageForm = row.dosageForm || row['รูปแบบยา'] || row['dosage_form'] || row.Form || 'เม็ด'
      const strength = row.strength || row['ความแรง'] || row.Strength || row.Strength
      const unit = row.unit || row['หน่วย'] || row.Unit || 'เม็ด'
      const minStock = parseInt(row.minStock || row['สต็อกขั้นต่ำ'] || row.MinStock || 0)
      const maxStock = parseInt(row.maxStock || row['สต็อกสูงสุด'] || row.MaxStock || 1000)
      const reorderPoint = parseInt(row.reorderPoint || row['จุดสั่งซื้อ'] || row.ReorderPoint || 50)
      const unitPrice = parseFloat(row.unitPrice || row['ราคา'] || row.UnitPrice || 0)

      if (!drugCode || !name) {
        results.errors.push(`ขาดข้อมูล: ${JSON.stringify(row).substring(0, 100)}`)
        continue
      }

      // Find category
      const categoryId = categoryMap[categoryName] || categoryMap['อื่นๆ'] || null

      // Check if drug exists
      const existing = await prisma.drug.findUnique({
        where: { drugCode: String(drugCode) }
      })

      if (existing) {
        await prisma.drug.update({
          where: { id: existing.id },
          data: {
            name: String(name),
            genericName: genericName ? String(genericName) : null,
            categoryId,
            dosageForm: dosageForm ? String(dosageForm) : null,
            strength: strength ? String(strength) : null,
            unit: String(unit),
            minStock,
            maxStock,
            reorderPoint,
            unitPrice: unitPrice || null
          }
        })
        results.updated++
      } else {
        await prisma.drug.create({
          data: {
            drugCode: String(drugCode),
            name: String(name),
            genericName: genericName ? String(genericName) : null,
            categoryId,
            dosageForm: dosageForm ? String(dosageForm) : null,
            strength: strength ? String(strength) : null,
            unit: String(unit),
            minStock,
            maxStock,
            reorderPoint,
            unitPrice: unitPrice || null
          }
        })
        results.created++
      }
    } catch (err) {
      const error = err as Error
      results.errors.push(`Error: ${error.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      total: data.length,
      ...results
    }
  })
}

async function ensureDrugCategories() {
  const defaultCategories = [
    { code: 'ANT', name: 'ยาปฏิชีวนะ' },
    { code: 'PAIN', name: 'ยาแก้ปวด' },
    { code: 'COLD', name: 'ยาแก้ไอ/หวัด' },
    { code: 'VIT', name: 'วิตามิน/อาหารเสริม' },
    { code: 'DERM', name: 'ยาภายนอก' },
    { code: 'INJ', name: 'ยาฉีด' },
    { code: 'CVS', name: 'ยาระบบหัวใจและหลอดเลือด' },
    { code: 'CNS', name: 'ยาระบบประสาท' },
    { code: 'GI', name: 'ยาระบบทางเดินอาหาร' },
    { code: 'RESP', name: 'ยาระบบทางเดินหายใจ' },
    { code: 'ENDO', name: 'ยาต่อมไร้ท่อ' },
    { code: 'OTHER', name: 'อื่นๆ' }
  ]

  const categories = []
  for (const cat of defaultCategories) {
    const existing = await prisma.drugCategory.findUnique({
      where: { code: cat.code }
    })
    if (existing) {
      categories.push(existing)
    } else {
      const created = await prisma.drugCategory.create({ data: cat })
      categories.push(created)
    }
  }
  return categories
}