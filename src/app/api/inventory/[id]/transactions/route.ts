import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inventory/[id]/transactions - ดึงประวัติการเคลื่อนไหวของคลังยา
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // หา hospitalId และ drugId จาก inventory
    const inventory = await prisma.drugInventory.findUnique({
      where: { id: parseInt(id) },
      select: { hospitalId: true, drugId: true }
    })

    if (!inventory) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรายการคลังยา' },
        { status: 404 }
      )
    }

    // ดึง transactions
    const transactions = await prisma.drugTransaction.findMany({
      where: {
        hospitalId: inventory.hospitalId,
        drugId: inventory.drugId
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงประวัติ' },
      { status: 500 }
    )
  }
}