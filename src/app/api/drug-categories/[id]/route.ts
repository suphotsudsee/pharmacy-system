import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/drug-categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const { id } = await params

    const category = await prisma.drugCategory.findUnique({
      where: { id: parseInt(id) }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error fetching drug category:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// PUT /api/drug-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    if (!body.code || !body.name) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    const category = await prisma.drugCategory.update({
      where: { id: parseInt(id) },
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating drug category:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดต' },
      { status: 500 }
    )
  }
}

// DELETE /api/drug-categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const { id } = await params

    const category = await prisma.drugCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { drugs: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }

    if (category._count.drugs > 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบได้ เพราะมียาในหมวดหมู่นี้' },
        { status: 400 }
      )
    }

    await prisma.drugCategory.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true, message: 'ลบหมวดยาสำเร็จ' })
  } catch (error) {
    console.error('Error deleting drug category:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบ' },
      { status: 500 }
    )
  }
}