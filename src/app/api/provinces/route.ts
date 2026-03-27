import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/provinces - ดึงรายการจังหวัดทั้งหมด
export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      include: {
        _count: {
          select: { hospitals: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: provinces
    })
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจังหวัด' },
      { status: 500 }
    )
  }
}

// POST /api/provinces - สร้างจังหวัดใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const province = await prisma.province.create({
      data: {
        code: body.code,
        name: body.name,
        region: body.region
      }
    })

    return NextResponse.json({ success: true, data: province })
  } catch (error) {
    console.error('Error creating province:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างจังหวัด' },
      { status: 500 }
    )
  }
}