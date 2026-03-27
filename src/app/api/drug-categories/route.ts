import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

// GET /api/drug-categories - ดึงรายการหมวดยา
export async function GET() {
  try {
    const categories = await prisma.drugCategory.findMany({
      include: {
        _count: {
          select: { drugs: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching drug categories:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST /api/drug-categories - สร้างหมวดยาใหม่
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

    const category = await prisma.drugCategory.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating drug category:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้าง' },
      { status: 500 }
    )
  }
}