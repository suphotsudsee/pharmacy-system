import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

// GET /api/provinces - ดึงรายการจังหวัดทั้งหมด
export async function GET() {
  try {
    const session = await auth()
    
    // Allow public access for viewing
    const provinces = await prisma.province.findMany({
      include: {
        _count: {
          select: { hospitals: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data: provinces })
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST /api/provinces - สร้างจังหวัดใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as SessionUser).role !== 'ADMIN') {
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

    // Check if code exists
    const existing = await prisma.province.findUnique({
      where: { code: body.code }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'รหัสจังหวัดนี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }

    const province = await prisma.province.create({
      data: {
        code: body.code,
        name: body.name,
        region: body.region || null,
      }
    })

    return NextResponse.json({ success: true, data: province })
  } catch (error) {
    console.error('Error creating province:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้าง' },
      { status: 500 }
    )
  }
}