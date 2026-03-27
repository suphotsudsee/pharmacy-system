import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/hospitals/[id] - ดึงข้อมูลโรงพยาบาลตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(id) },
      include: {
        province: true,
        facilityType: true,
        serviceLevel: true,
        drugInventories: {
          include: { drug: true },
          orderBy: { drug: { name: 'asc' } }
        }
      }
    })

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบโรงพยาบาล' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: hospital })
  } catch (error) {
    console.error('Error fetching hospital:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล' },
      { status: 500 }
    )
  }
}

// PUT /api/hospitals/[id] - อัปเดตข้อมูลโรงพยาบาล
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const hospital = await prisma.hospital.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        shortName: body.shortName,
        provinceId: body.provinceId,
        facilityTypeId: body.facilityTypeId,
        serviceLevelId: body.serviceLevelId,
        googleSheetLink: body.googleSheetLink,
        address: body.address,
        phone: body.phone,
        fax: body.fax,
        email: body.email,
        isActive: body.isActive
      },
      include: {
        province: true,
        facilityType: true,
        serviceLevel: true
      }
    })

    return NextResponse.json({ success: true, data: hospital })
  } catch (error) {
    console.error('Error updating hospital:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลโรงพยาบาล' },
      { status: 500 }
    )
  }
}

// DELETE /api/hospitals/[id] - ลบโรงพยาบาล (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const hospital = await prisma.hospital.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true, data: hospital })
  } catch (error) {
    console.error('Error deleting hospital:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบโรงพยาบาล' },
      { status: 500 }
    )
  }
}