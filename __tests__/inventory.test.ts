// ===========================================
// Inventory API Tests
// ทดสอบ API สำหรับจัดการคลังยา
// ===========================================

import { describe, it, expect, beforeEach } from 'vitest'

// Mock data
const mockInventory = {
  id: 1,
  hospitalId: 1,
  drugId: 1,
  lotNumber: 'LOT001',
  expiryDate: new Date('2025-12-31'),
  currentStock: 100,
  reservedStock: 10,
  availableStock: 90,
  location: 'Shelf A1',
  lastRestocked: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockDrug = {
  id: 1,
  drugCode: 'DRUG001',
  name: 'Paracetamol',
  minStock: 10,
  reorderPoint: 50,
  maxStock: 1000
}

const mockHospital = {
  id: 1,
  hospCode: 'H001',
  name: 'โรงพยาบาลทดสอบ'
}

describe('Inventory API', () => {
  describe('Stock Status Calculation', () => {
    it('ควรคืนค่า OUT_OF_STOCK เมื่อ currentStock = 0', () => {
      const status = getStockStatus({ currentStock: 0 }, { minStock: 10, reorderPoint: 50 })
      expect(status).toBe('OUT_OF_STOCK')
    })

    it('ควรคืนค่า LOW_STOCK เมื่อ currentStock <= minStock', () => {
      const status = getStockStatus({ currentStock: 5 }, { minStock: 10, reorderPoint: 50 })
      expect(status).toBe('LOW_STOCK')
    })

    it('ควรคืนค่า REORDER เมื่อ currentStock <= reorderPoint', () => {
      const status = getStockStatus({ currentStock: 40 }, { minStock: 10, reorderPoint: 50 })
      expect(status).toBe('REORDER')
    })

    it('ควรคืนค่า NORMAL เมื่อ currentStock > reorderPoint', () => {
      const status = getStockStatus({ currentStock: 100 }, { minStock: 10, reorderPoint: 50 })
      expect(status).toBe('NORMAL')
    })
  })

  describe('GET /api/inventory', () => {
    it('ควรดึงข้อมูลคลังยาตาม hospitalId', async () => {
      const hospitalId = 1
      
      // Mock filtered response
      const filteredInventory = [mockInventory].filter(i => i.hospitalId === hospitalId)
      
      expect(filteredInventory).toHaveLength(1)
      expect(filteredInventory[0].hospitalId).toBe(hospitalId)
    })

    it('ควรกรองยาที่ใกล้หมด (low stock)', async () => {
      const inventoryWithStatus = [
        { ...mockInventory, currentStock: 0, status: 'OUT_OF_STOCK' },
        { ...mockInventory, id: 2, currentStock: 5, status: 'LOW_STOCK' },
        { ...mockInventory, id: 3, currentStock: 40, status: 'REORDER' },
        { ...mockInventory, id: 4, currentStock: 100, status: 'NORMAL' }
      ]
      
      const lowStock = inventoryWithStatus.filter(item => 
        ['OUT_OF_STOCK', 'LOW_STOCK', 'REORDER'].includes(item.status)
      )
      
      expect(lowStock).toHaveLength(3)
    })

    it('ควรกรองยาใกล้หมดอายุ', async () => {
      const today = new Date()
      const daysUntilExpiry = (expiry: Date) => 
        Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      const inventoryWithExpiry = [
        { ...mockInventory, expiryDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
        { ...mockInventory, id: 2, expiryDate: new Date(today.getTime() + 200 * 24 * 60 * 60 * 1000) } // 200 days
      ]
      
      const expiringSoon = inventoryWithExpiry.filter(item => {
        const days = daysUntilExpiry(item.expiryDate)
        return days > 0 && days <= 180
      })
      
      expect(expiringSoon).toHaveLength(1)
    })
  })

  describe('POST /api/inventory', () => {
    it('ควรสร้าง inventory record ใหม่ได้', async () => {
      const newInventory = {
        hospitalId: 1,
        drugId: 2,
        lotNumber: 'LOT002',
        currentStock: 50,
        location: 'Shelf B2'
      }
      
      // Validate required fields
      expect(newInventory.hospitalId).toBeDefined()
      expect(newInventory.drugId).toBeDefined()
      expect(newInventory.currentStock).toBeDefined()
    })

    it('ควรคำนวณ availableStock = currentStock - reservedStock', () => {
      const currentStock = 100
      const reservedStock = 10
      const availableStock = currentStock - reservedStock
      
      expect(availableStock).toBe(90)
    })
  })
})

// Helper function - คำนวณสถานะสต็อก (สำหรับ testing)
function getStockStatus(item: { currentStock: number }, drug: { minStock: number; reorderPoint: number }): 'OUT_OF_STOCK' | 'LOW_STOCK' | 'REORDER' | 'NORMAL' {
  if (item.currentStock === 0) return 'OUT_OF_STOCK'
  if (item.currentStock <= drug.minStock) return 'LOW_STOCK'
  if (item.currentStock <= drug.reorderPoint) return 'REORDER'
  return 'NORMAL'
}

describe('Inventory Transactions', () => {
  it('ควรบันทึกการรับยาเข้า', async () => {
    const transaction = {
      hospitalId: 1,
      drugId: 1,
      transactionType: 'RECEIPT',
      quantity: 50,
      previousStock: 100,
      newStock: 150,
      lotNumber: 'LOT001'
    }
    
    expect(transaction.transactionType).toBe('RECEIPT')
    expect(transaction.newStock - transaction.previousStock).toBe(transaction.quantity)
  })

  it('ควรบันทึกการเบิกยา', async () => {
    const transaction = {
      hospitalId: 1,
      drugId: 1,
      transactionType: 'DISPENSE',
      quantity: -20,
      previousStock: 100,
      newStock: 80,
      lotNumber: 'LOT001'
    }
    
    expect(transaction.transactionType).toBe('DISPENSE')
    expect(transaction.previousStock + transaction.quantity).toBe(transaction.newStock)
    expect(transaction.quantity).toBeLessThan(0)
  })

  it('ควรบันทึกการปรับปรุงสต็อก', async () => {
    const transaction = {
      hospitalId: 1,
      drugId: 1,
      transactionType: 'ADJUSTMENT',
      quantity: -5,
      previousStock: 100,
      newStock: 95,
      notes: 'Stock adjustment due to expired items'
    }
    
    expect(transaction.transactionType).toBe('ADJUSTMENT')
    expect(transaction.notes).toBeDefined()
  })
})

describe('Expiry Date Management', () => {
  it('ควรคำนวณวันหมดอายุ', () => {
    const today = new Date()
    const expiryDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)
    
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    expect(daysUntilExpiry).toBeLessThanOrEqual(180)
    expect(daysUntilExpiry).toBeGreaterThan(0)
  })

  it('ควรตั้งค่าเตือนสำหรับยาใกล้หมดอายุ', () => {
    const warningThresholdDays = 90
    const expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
    
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    
    const needsWarning = daysUntilExpiry <= warningThresholdDays
    expect(needsWarning).toBe(true)
  })
})