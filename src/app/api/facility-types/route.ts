import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/facility-types - ดึงรายการประเภทสถานบริการ
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

    return NextResponse.json({ success: true, data: facilityTypes })
  } catch (error) {
    console.error('Error fetching facility types:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST /api/facility-types - สร้างประเภทสถานบริการใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.code || !body.name) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    const facilityType = await prisma.facilityType.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      }
    })

    return NextResponse.json({ success: true, data: facilityType })
  } catch (error) {
    console.error('Error creating facility type:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้าง' },
      { status: 500 }
    )
  }
}