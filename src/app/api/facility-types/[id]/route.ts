import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/facility-types/[id]
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

    const facilityType = await prisma.facilityType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { hospitals: true }
        }
      }
    })

    if (!facilityType) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: facilityType })
  } catch (error) {
    console.error('Error fetching facility type:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// PUT /api/facility-types/[id]
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

    const facilityType = await prisma.facilityType.update({
      where: { id: parseInt(id) },
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      }
    })

    return NextResponse.json({ success: true, data: facilityType })
  } catch (error) {
    console.error('Error updating facility type:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดต' },
      { status: 500 }
    )
  }
}

// DELETE /api/facility-types/[id]
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

    const facilityType = await prisma.facilityType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { hospitals: true }
        }
      }
    })

    if (!facilityType) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล' },
        { status: 404 }
      )
    }

    if (facilityType._count.hospitals > 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบได้ เพราะมีโรงพยาบาลใช้ประเภทนี้' },
        { status: 400 }
      )
    }

    await prisma.facilityType.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true, message: 'ลบประเภทสถานบริการสำเร็จ' })
  } catch (error) {
    console.error('Error deleting facility type:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบ' },
      { status: 500 }
    )
  }
}