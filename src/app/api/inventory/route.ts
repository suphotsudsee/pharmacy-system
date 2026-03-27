import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inventory - ดึงข้อมูลคลังยา
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const drugId = searchParams.get('drugId')
    const lowStock = searchParams.get('lowStock') === 'true'
    const expiringSoon = searchParams.get('expiringSoon') === 'true'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (hospitalId) where.hospitalId = parseInt(hospitalId)
    if (drugId) where.drugId = parseInt(drugId)
    
    // ค้นหายา
    if (search) {
      where.drug = {
        OR: [
          { drugCode: { contains: search } },
          { name: { contains: search } },
          { genericName: { contains: search } }
        ]
      }
    }

    const [inventory, total] = await Promise.all([
      prisma.drugInventory.findMany({
        where,
        include: {
          hospital: true,
          drug: { include: { category: true } }
        },
        skip,
        take: limit,
        orderBy: [{ drug: { name: 'asc' } }]
      }),
      prisma.drugInventory.count({ where })
    ])

    // เพิ่มข้อมูลสถานะและกรอง
    let inventoryWithStatus = inventory.map(item => {
      const drug = item.drug as any
      const status = getStockStatus(item, drug)
      const daysUntilExpiry = item.expiryDate 
        ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
      
      return {
        ...item,
        status,
        daysUntilExpiry
      }
    })

    // กรองยาใกล้หมด (หลังจากคำนวณ status แล้ว)
    if (lowStock) {
      inventoryWithStatus = inventoryWithStatus.filter(item => 
        item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK' || item.status === 'REORDER'
      )
    }

    // กรองยาใกล้หมดอายุ (หลังจากคำนวณ daysUntilExpiry แล้ว)
    if (expiringSoon) {
      inventoryWithStatus = inventoryWithStatus.filter(item => 
        item.daysUntilExpiry !== null && item.daysUntilExpiry <= 180 && item.daysUntilExpiry > 0
      )
    }

    return NextResponse.json({
      success: true,
      data: inventoryWithStatus,
      pagination: {
        page,
        limit,
        total: lowStock || expiringSoon ? inventoryWithStatus.length : total,
        totalPages: Math.ceil((lowStock || expiringSoon ? inventoryWithStatus.length : total) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคลังยา' },
      { status: 500 }
    )
  }
}

// POST /api/inventory - เพิ่ม/ปรับปรุงสต็อกยา
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // ตรวจสอบว่ามี record อยู่แล้วหรือไม่
    const existing = await prisma.drugInventory.findFirst({
      where: {
        hospitalId: body.hospitalId,
        drugId: body.drugId,
        lotNumber: body.lotNumber || null
      }
    })

    let inventory
    if (existing) {
      // อัปเดต
      inventory = await prisma.drugInventory.update({
        where: { id: existing.id },
        data: {
          currentStock: body.currentStock,
          availableStock: body.currentStock - existing.reservedStock,
          lotNumber: body.lotNumber,
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
          location: body.location,
          lastRestocked: new Date()
        },
        include: {
          hospital: true,
          drug: true
        }
      })
    } else {
      // สร้างใหม่
      inventory = await prisma.drugInventory.create({
        data: {
          hospitalId: body.hospitalId,
          drugId: body.drugId,
          lotNumber: body.lotNumber,
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
          currentStock: body.currentStock,
          reservedStock: 0,
          availableStock: body.currentStock,
          location: body.location,
          lastRestocked: new Date()
        },
        include: {
          hospital: true,
          drug: true
        }
      })
    }

    // บันทึก transaction
    await prisma.drugTransaction.create({
      data: {
        hospitalId: body.hospitalId,
        drugId: body.drugId,
        transactionType: 'RECEIPT',
        quantity: body.currentStock,
        previousStock: existing?.currentStock || 0,
        newStock: inventory.currentStock,
        lotNumber: body.lotNumber,
        notes: body.notes,
        performedBy: body.performedBy
      }
    })

    return NextResponse.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตคลังยา' },
      { status: 500 }
    )
  }
}

// Helper function - คำนวณสถานะสต็อก
function getStockStatus(item: any, drug: any) {
  if (item.currentStock === 0) return 'OUT_OF_STOCK'
  if (item.currentStock <= drug.minStock) return 'LOW_STOCK'
  if (item.currentStock <= drug.reorderPoint) return 'REORDER'
  return 'NORMAL'
}