import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inventory/[id] - ดึงข้อมูลคลังยาตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const inventory = await prisma.drugInventory.findUnique({
      where: { id: parseInt(id) },
      include: {
        hospital: true,
        drug: {
          include: { category: true }
        }
      }
    })

    if (!inventory) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรายการคลังยา' },
        { status: 404 }
      )
    }

    // คำนวณสถานะ
    const status = getStockStatus(inventory)
    const daysUntilExpiry = inventory.expiryDate 
      ? Math.ceil((new Date(inventory.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({ 
      success: true, 
      data: {
        ...inventory,
        status,
        daysUntilExpiry
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

// PUT /api/inventory/[id] - อัปเดตข้อมูลคลังยา
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // ดึงข้อมูลเดิม
    const existing = await prisma.drugInventory.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรายการคลังยา' },
        { status: 404 }
      )
    }

    const previousStock = existing.currentStock
    const newStock = body.currentStock ?? existing.currentStock

    // อัปเดตคลังยา
    const inventory = await prisma.drugInventory.update({
      where: { id: parseInt(id) },
      data: {
        lotNumber: body.lotNumber ?? existing.lotNumber,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : existing.expiryDate,
        currentStock: newStock,
        reservedStock: body.reservedStock ?? existing.reservedStock,
        availableStock: newStock - (body.reservedStock ?? existing.reservedStock),
        location: body.location ?? existing.location,
      },
      include: {
        hospital: true,
        drug: true
      }
    })

    // บันทึก transaction ถ้ามีการเปลี่ยนแปลงสต็อก
    if (newStock !== previousStock) {
      await prisma.drugTransaction.create({
        data: {
          hospitalId: existing.hospitalId,
          drugId: existing.drugId,
          transactionType: 'ADJUSTMENT',
          quantity: newStock - previousStock,
          previousStock,
          newStock,
          lotNumber: body.lotNumber ?? existing.lotNumber,
          notes: body.notes || 'ปรับปรุงสต็อก',
          performedBy: body.performedBy || 'System'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...inventory,
        status: getStockStatus(inventory)
      }
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตคลังยา' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/[id] - ลบรายการคลังยา
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // ตรวจสอบว่ามีการจองหรือไม่
    const inventory = await prisma.drugInventory.findUnique({
      where: { id: parseInt(id) }
    })

    if (!inventory) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรายการคลังยา' },
        { status: 404 }
      )
    }

    if (inventory.reservedStock > 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบได้ เนื่องจากมีการจองสต็อกอยู่' },
        { status: 400 }
      )
    }

    // บันทึก transaction ก่อนลบ
    await prisma.drugTransaction.create({
      data: {
        hospitalId: inventory.hospitalId,
        drugId: inventory.drugId,
        transactionType: 'ADJUSTMENT',
        quantity: -inventory.currentStock,
        previousStock: inventory.currentStock,
        newStock: 0,
        lotNumber: inventory.lotNumber,
        notes: 'ลบรายการคลังยา',
        performedBy: 'System'
      }
    })

    // ลบคลังยา
    await prisma.drugInventory.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'ลบรายการคลังยาเรียบร้อยแล้ว' 
    })
  } catch (error) {
    console.error('Error deleting inventory:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบคลังยา' },
      { status: 500 }
    )
  }
}

function getStockStatus(item: { currentStock: number; drug: { minStock: number; reorderPoint: number } }) {
  if (item.currentStock === 0) return 'OUT_OF_STOCK'
  if (item.currentStock <= item.drug.minStock) return 'LOW_STOCK'
  if (item.currentStock <= item.drug.reorderPoint) return 'REORDER'
  return 'NORMAL'
}