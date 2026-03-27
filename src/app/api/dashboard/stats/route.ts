import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/stats - สถิติ Dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')

    const where = hospitalId ? { hospitalId: parseInt(hospitalId) } : {}

    // นับจำนวนต่างๆ
    const [
      totalHospitals,
      totalDrugs,
      totalInventory,
      pendingRequests,
      allInventory
    ] = await Promise.all([
      prisma.hospital.count({ where: { isActive: true } }),
      prisma.drug.count({ where: { isActive: true } }),
      prisma.drugInventory.count({ where }),
      prisma.drugRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.drugInventory.findMany({
        where,
        include: {
          hospital: { select: { name: true } },
          drug: {
            select: {
              name: true,
              unit: true,
              minStock: true,
              reorderPoint: true
            }
          }
        }
      })
    ])

    // คำนวณยาใกล้หมด
    const lowStockItems = allInventory.filter(item => {
      const drug = item.drug
      if (item.currentStock === 0) return true
      if (item.currentStock <= drug.minStock) return true
      if (item.currentStock <= drug.reorderPoint) return true
      return false
    })

    // คำนวณยาใกล้หมดอายุ
    const now = Date.now()
    const expiringItems = allInventory.filter(item => {
      if (!item.expiryDate) return false
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry > 0 && daysUntilExpiry <= 180
    })

    // ยาที่ใกล้หมด (สำหรับแสดงใน alerts)
    const lowStockAlerts = lowStockItems.slice(0, 10).map(item => ({
      id: item.id,
      drug: item.drug.name,
      hospital: item.hospital?.name || 'Unknown',
      currentStock: item.currentStock,
      unit: item.drug.unit,
      minStock: item.drug.minStock,
      reorderPoint: item.drug.reorderPoint
    }))

    // ยาใกล้หมดอายุ (สำหรับแสดงใน alerts)
    const expiringAlerts = expiringItems.slice(0, 10).map(item => {
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate!).getTime() - now) / (1000 * 60 * 60 * 24))
      return {
        id: item.id,
        drug: item.drug.name,
        hospital: item.hospital?.name || 'Unknown',
        expiryDate: item.expiryDate,
        daysUntilExpiry
      }
    })

    // การเบิกยาล่าสุด
    const recentRequests = await prisma.drugRequest.findMany({
      where,
      include: { hospital: { select: { name: true } } },
      orderBy: { requestDate: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalHospitals,
          totalDrugs,
          totalInventory,
          pendingRequests,
          lowStockItems: lowStockItems.length,
          expiringItems: expiringItems.length
        },
        alerts: {
          lowStock: lowStockAlerts,
          expiring: expiringAlerts
        },
        recentRequests: recentRequests.map(req => ({
          id: req.id,
          requestNumber: req.requestNumber,
          hospital: req.hospital.name,
          status: req.status,
          requestDate: req.requestDate
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    )
  }
}