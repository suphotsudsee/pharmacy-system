import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/drug-categories - ดึงรายการหมวดหมู่ยาทั้งหมด
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

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching drug categories:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ยา' },
      { status: 500 }
    )
  }
}

// POST /api/drug-categories - สร้างหมวดหมู่ยาใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const category = await prisma.drugCategory.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating drug category:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่ยา' },
      { status: 500 }
    )
  }
}