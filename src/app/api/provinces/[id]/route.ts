import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/provinces/[id] - ดึงข้อมูลจังหวัด
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

    const province = await prisma.province.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { hospitals: true }
        }
      }
    })

    if (!province) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบจังหวัด' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: province })
  } catch (error) {
    console.error('Error fetching province:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// PUT /api/provinces/[id] - อัปเดตจังหวัด
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

    // Check if code exists (by another province)
    const existing = await prisma.province.findFirst({
      where: {
        code: body.code,
        NOT: { id: parseInt(id) }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'รหัสจังหวัดนี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }

    const province = await prisma.province.update({
      where: { id: parseInt(id) },
      data: {
        code: body.code,
        name: body.name,
        region: body.region || null,
      }
    })

    return NextResponse.json({ success: true, data: province })
  } catch (error) {
    console.error('Error updating province:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดต' },
      { status: 500 }
    )
  }
}

// DELETE /api/provinces/[id] - ลบจังหวัด
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

    // Check if has hospitals
    const province = await prisma.province.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { hospitals: true }
        }
      }
    })

    if (!province) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบจังหวัด' },
        { status: 404 }
      )
    }

    if (province._count.hospitals > 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบได้ เพราะมีโรงพยาบาลในจังหวัดนี้' },
        { status: 400 }
      )
    }

    await prisma.province.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true, message: 'ลบจังหวัดสำเร็จ' })
  } catch (error) {
    console.error('Error deleting province:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบ' },
      { status: 500 }
    )
  }
}