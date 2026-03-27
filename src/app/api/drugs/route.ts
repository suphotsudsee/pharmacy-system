import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/drugs - ดึงรายการยาทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    
    if (categoryId) where.categoryId = parseInt(categoryId)
    if (search) {
      where.OR = [
        { drugCode: { contains: search } },
        { name: { contains: search } },
        { genericName: { contains: search } }
      ]
    }

    const [drugs, total] = await Promise.all([
      prisma.drug.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.drug.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: drugs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching drugs:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยา' },
      { status: 500 }
    )
  }
}

// POST /api/drugs - สร้างยาใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const drug = await prisma.drug.create({
      data: {
        drugCode: body.drugCode,
        name: body.name,
        genericName: body.genericName,
        categoryId: body.categoryId,
        dosageForm: body.dosageForm,
        strength: body.strength,
        unit: body.unit,
        minStock: body.minStock || 0,
        maxStock: body.maxStock || 1000,
        reorderPoint: body.reorderPoint || 50,
        unitPrice: body.unitPrice
      },
      include: { category: true }
    })

    return NextResponse.json({ success: true, data: drug })
  } catch (error) {
    console.error('Error creating drug:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างยา' },
      { status: 500 }
    )
  }
}