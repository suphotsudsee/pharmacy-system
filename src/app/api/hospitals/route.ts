import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/hospitals - ดึงรายการโรงพยาบาลทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('provinceId')
    const facilityTypeId = searchParams.get('facilityTypeId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    
    if (provinceId) where.provinceId = parseInt(provinceId)
    if (facilityTypeId) where.facilityTypeId = parseInt(facilityTypeId)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { hospCode: { contains: search } },
        { shortName: { contains: search } }
      ]
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        include: {
          province: true,
          facilityType: true,
          serviceLevel: true,
          _count: {
            select: { drugInventories: true }
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.hospital.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล' },
      { status: 500 }
    )
  }
}

// POST /api/hospitals - สร้างโรงพยาบาลใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const hospital = await prisma.hospital.create({
      data: {
        hospCode: body.hospCode,
        name: body.name,
        shortName: body.shortName,
        provinceId: body.provinceId,
        facilityTypeId: body.facilityTypeId,
        serviceLevelId: body.serviceLevelId,
        googleSheetLink: body.googleSheetLink,
        address: body.address,
        phone: body.phone,
        fax: body.fax,
        email: body.email
      },
      include: {
        province: true,
        facilityType: true,
        serviceLevel: true
      }
    })

    return NextResponse.json({ success: true, data: hospital })
  } catch (error) {
    console.error('Error creating hospital:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างโรงพยาบาล' },
      { status: 500 }
    )
  }
}