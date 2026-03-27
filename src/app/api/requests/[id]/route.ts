import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/requests/[id] - ดึงข้อมูลใบเบิกยาตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const drugRequest = await prisma.drugRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        hospital: true,
        items: {
          include: { drug: { include: { category: true } } },
          orderBy: { id: 'asc' }
        }
      }
    })

    if (!drugRequest) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบใบเบิกยา' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: drugRequest })
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิกยา' },
      { status: 500 }
    )
  }
}

// PUT /api/requests/[id] - อัปเดตสถานะใบเบิกยา
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // ตรวจสอบสถานะปัจจุบัน
    const currentRequest = await prisma.drugRequest.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { drug: true } } }
    })

    if (!currentRequest) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบใบเบิกยา' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่าสามารถเปลี่ยนสถานะได้หรือไม่
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': [],
      'REJECTED': []
    }

    if (!validTransitions[currentRequest.status]?.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถเปลี่ยนสถานะจาก ${currentRequest.status} เป็น ${body.status}` },
        { status: 400 }
      )
    }

    // อัปเดตสถานะ
    const updateData: any = {
      status: body.status,
      approvedBy: body.approvedBy || currentRequest.approvedBy
    }

    // ถ้าอนุมัติ ให้บันทึกวันที่อนุมัติ
    if (body.status === 'APPROVED') {
      updateData.approvedBy = body.approvedBy
    }

    // ถ้ามีการอัปเดตจำนวนอนุมัติ
    if (body.items) {
      for (const item of body.items) {
        await prisma.drugRequestItem.update({
          where: { id: item.id },
          data: { approvedQuantity: item.approvedQuantity }
        })
      }
    }

    const drugRequest = await prisma.drugRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        hospital: true,
        items: { include: { drug: true } }
      }
    })

    // ถ้าสถานะเป็น COMPLETED ให้ลดสต็อก
    if (body.status === 'COMPLETED' && currentRequest.status !== 'COMPLETED') {
      for (const item of currentRequest.items) {
        // หา inventory
        const inventory = await prisma.drugInventory.findFirst({
          where: {
            hospitalId: currentRequest.hospitalId,
            drugId: item.drugId
          }
        })

        if (inventory) {
          const approvedQty = body.items?.find((i: any) => i.id === item.id)?.approvedQuantity || item.quantity
          
          // ลดสต็อก
          await prisma.drugInventory.update({
            where: { id: inventory.id },
            data: {
              currentStock: inventory.currentStock - approvedQty,
              availableStock: inventory.availableStock - approvedQty
            }
          })

          // บันทึก transaction
          await prisma.drugTransaction.create({
            data: {
              hospitalId: currentRequest.hospitalId,
              drugId: item.drugId,
              transactionType: 'DISPENSE',
              requestId: currentRequest.id,
              quantity: -approvedQty,
              previousStock: inventory.currentStock,
              newStock: inventory.currentStock - approvedQty,
              notes: `เบิกยา - ${currentRequest.requestNumber}`,
              performedBy: body.approvedBy || 'System'
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, data: drugRequest })
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตใบเบิกยา' },
      { status: 500 }
    )
  }
}

// DELETE /api/requests/[id] - ลบใบเบิกยา (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const drugRequest = await prisma.drugRequest.findUnique({
      where: { id: parseInt(id) }
    })

    if (!drugRequest) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบใบเบิกยา' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่าสามารถลบได้หรือไม่ (ลบได้เฉพาะ PENDING)
    if (drugRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบใบเบิกยาที่ไม่อยู่ในสถานะรออนุมัติ' },
        { status: 400 }
      )
    }

    // ลบ items ก่อน
    await prisma.drugRequestItem.deleteMany({
      where: { requestId: parseInt(id) }
    })

    // ลบ request
    await prisma.drugRequest.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'ลบใบเบิกยาเรียบร้อยแล้ว' 
    })
  } catch (error) {
    console.error('Error deleting request:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบใบเบิกยา' },
      { status: 500 }
    )
  }
}