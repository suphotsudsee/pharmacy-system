import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/inventory/fix - แก้ไข availableStock ให้ถูกต้อง
export async function POST() {
  try {
    // ดึง inventory ทั้งหมด
    const inventory = await prisma.drugInventory.findMany()

    // แก้ไขทีละรายการ
    let fixed = 0
    for (const item of inventory) {
      const correctAvailable = item.currentStock - item.reservedStock
      if (item.availableStock !== correctAvailable) {
        await prisma.drugInventory.update({
          where: { id: item.id },
          data: { availableStock: correctAvailable }
        })
        fixed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} inventory items`,
      total: inventory.length,
      fixed
    })
  } catch (error) {
    console.error('Error fixing inventory:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' },
      { status: 500 }
    )
  }
}