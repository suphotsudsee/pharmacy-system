import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as xlsx from 'xlsx'
import { readFile } from 'fs/promises'

// POST /api/import/excel - Import hospitals from Excel
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกไฟล์ Excel' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)

    // สร้าง default province (จังหวัดที่ข้อมูลนี้มา)
    let ubonProvince = await prisma.province.findFirst({
      where: { code: 'UB' }
    })
    
    if (!ubonProvince) {
      ubonProvince = await prisma.province.create({
        data: {
          code: 'UB',
          name: 'อุบลราชธานี',
          region: 'อีสาน'
        }
      })
    }

    // สร้าง default facility types
    const facilityTypes = await prisma.facilityType.findMany()
    const facilityTypeMap: Record<string, number> = {}
    
    for (const ft of facilityTypes) {
      facilityTypeMap[ft.code] = ft.id
    }
    
    // หา facility types จากข้อมูล
    const typeSet = new Set<string>()
    for (const row of data as any[]) {
      const type = row['ประเภทสถานบริการ'] || row['type'] || 'รพ.สต.'
      typeSet.add(type)
    }
    
    for (const typeName of typeSet) {
      if (!facilityTypeMap[typeName]) {
        const ft = await prisma.facilityType.create({
          data: { code: typeName, name: typeName }
        })
        facilityTypeMap[typeName] = ft.id
      }
    }

    // Import hospitals
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    }

    for (const row of data as any[]) {
      try {
        const hospCode = row['Hosp_Code'] || row['hospCode'] || row['รหัส'] || row['code']
        const name = row['Hosp_Name'] || row['hospName'] || row['ชื่อ'] || row['name']
        const shortName = row['short_name'] || row['ชื่อย่อ'] || null
        const googleSheetLink = row['link ดาวน์โหลด'] || row['link'] || row['ลิงก์'] || null
        const typeName = row['ประเภทสถานบริการ'] || row['type'] || 'รพ.สต.'

        if (!hospCode || !name) {
          results.errors.push(`ขาดข้อมูล: ${JSON.stringify(row).substring(0, 100)}`)
          continue
        }

        // ตรวจสอบว่ามีโรงพยาบาลนี้แล้วหรือไม่
        const existing = await prisma.hospital.findUnique({
          where: { hospCode: String(hospCode) }
        })

        if (existing) {
          await prisma.hospital.update({
            where: { id: existing.id },
            data: {
              name: String(name),
              shortName: shortName ? String(shortName) : null,
              googleSheetLink: googleSheetLink ? String(googleSheetLink) : null,
              facilityTypeId: facilityTypeMap[typeName] || null
            }
          })
          results.updated++
        } else {
          await prisma.hospital.create({
            data: {
              hospCode: String(hospCode),
              name: String(name),
              shortName: shortName ? String(shortName) : null,
              provinceId: ubonProvince.id,
              googleSheetLink: googleSheetLink ? String(googleSheetLink) : null,
              facilityTypeId: facilityTypeMap[typeName] || null
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
  } catch (error) {
    console.error('Error importing Excel:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' },
      { status: 500 }
    )
  }
}