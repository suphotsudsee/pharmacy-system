import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/drugs/[id] - ดึงข้อมูลยาตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const drug = await prisma.drug.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        _count: {
          select: { inventories: true, requests: true }
        }
      }
    })

    if (!drug) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรายการยา' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: drug })
  } catch (error) {
    console.error('Error fetching drug:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยา' },
      { status: 500 }
    )
  }
}

// PUT /api/drugs/[id] - อัปเดตข้อมูลยา
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const drug = await prisma.drug.update({
      where: { id: parseInt(id) },
      data: {
        drugCode: body.drugCode,
        name: body.name,
        genericName: body.genericName,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        dosageForm: body.dosageForm,
        strength: body.strength,
        unit: body.unit,
        minStock: body.minStock || 0,
        maxStock: body.maxStock || 1000,
        reorderPoint: body.reorderPoint || 50,
        unitPrice: body.unitPrice,
        isActive: body.isActive ?? true
      },
      include: { category: true }
    })

    return NextResponse.json({ success: true, data: drug })
  } catch (error) {
    console.error('Error updating drug:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลยา' },
      { status: 500 }
    )
  }
}

// DELETE /api/drugs/[id] - ลบยา (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if drug is used in inventory or requests
    const inventoryCount = await prisma.drugInventory.count({
      where: { drugId: parseInt(id) }
    })
    
    const requestCount = await prisma.drugRequestItem.count({
      where: { drugId: parseInt(id) }
    })
    
    if (inventoryCount > 0 || requestCount > 0) {
      // Soft delete if used
      const drug = await prisma.drug.update({
        where: { id: parseInt(id) },
        data: { isActive: false }
      })
      return NextResponse.json({ 
        success: true, 
        data: drug,
        message: 'ยาถูกปิดการใช้งาน (มีการใช้งานในระบบ)'
      })
    }
    
    // Hard delete if not used
    await prisma.drug.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'ลบยาเรียบร้อยแล้ว' 
    })
  } catch (error) {
    console.error('Error deleting drug:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบยา' },
      { status: 500 }
    )
  }
}