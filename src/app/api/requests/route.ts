import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { DrugRequestWhereInput, CreateDrugRequest } from '@/types/api'

// GET /api/requests - ดึงรายการใบเบิกยา
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // ใช้ Prisma type แทน any
    const where: DrugRequestWhereInput = {}
    
    if (hospitalId) where.hospitalId = parseInt(hospitalId)
    if (status) where.status = status as DrugRequestWhereInput['status']
    if (startDate || endDate) {
      where.requestDate = {}
      if (startDate) where.requestDate.gte = new Date(startDate)
      if (endDate) where.requestDate.lte = new Date(endDate)
    }

    const [requests, total] = await Promise.all([
      prisma.drugRequest.findMany({
        where,
        include: {
          hospital: true,
          items: {
            include: { drug: true },
            orderBy: { id: 'asc' }
          }
        },
        skip,
        take: limit,
        orderBy: { requestDate: 'desc' }
      }),
      prisma.drugRequest.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิกยา' },
      { status: 500 }
    )
  }
}

// POST /api/requests - สร้างใบเบิกยาใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // สร้างเลขที่ใบเบิก
    const count = await prisma.drugRequest.count()
    const requestNumber = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    const drugRequest = await prisma.drugRequest.create({
      data: {
        requestNumber,
        hospitalId: body.hospitalId,
        requestDate: new Date(),
        requiredDate: body.requiredDate ? new Date(body.requiredDate) : null,
        status: 'PENDING',
        requestedBy: body.requestedBy,
        notes: body.notes,
        items: {
          create: body.items.map((item: any) => ({
            drugId: item.drugId,
            quantity: item.quantity,
            notes: item.notes
          }))
        }
      },
      include: {
        hospital: true,
        items: { include: { drug: true } }
      }
    })

    return NextResponse.json({ success: true, data: drugRequest })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างใบเบิกยา' },
      { status: 500 }
    )
  }
}