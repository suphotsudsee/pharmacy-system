import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/facility-types - ดึงรายการประเภทสถานบริการทั้งหมด
export async function GET() {
  try {
    const facilityTypes = await prisma.facilityType.findMany({
      include: {
        _count: {
          select: { hospitals: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: facilityTypes
    })
  } catch (error) {
    console.error('Error fetching facility types:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสถานบริการ' },
      { status: 500 }
    )
  }
}

// POST /api/facility-types - สร้างประเภทสถานบริการใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const facilityType = await prisma.facilityType.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description
      }
    })

    return NextResponse.json({ success: true, data: facilityType })
  } catch (error) {
    console.error('Error creating facility type:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างประเภทสถานบริการ' },
      { status: 500 }
    )
  }
}