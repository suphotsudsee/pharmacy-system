// ===========================================
// Type definitions สำหรับ API routes
// Pharmacy Inventory System
// ===========================================

import type { Prisma } from '../generated/prisma/client'
import type { 
  DrugModel as Drug, 
  DrugInventoryModel as DrugInventory, 
  HospitalModel as Hospital, 
  ProvinceModel as Province,
  FacilityTypeModel as FacilityType,
  DrugCategoryModel as DrugCategory,
  DrugRequestModel as DrugRequest,
} from '../generated/prisma/models'

// RequestStatus is an enum, not a model
import type { RequestStatus } from '../generated/prisma/enums'

// ==================== Drug Types ====================
// ใช้ Prisma generated types แทน any
export type DrugWhereInput = Prisma.DrugWhereInput
export type DrugWithCategory = Drug & {
  category: DrugCategory | null
}

// ==================== Inventory Types ====================
export type DrugInventoryWhereInput = Prisma.DrugInventoryWhereInput
export type InventoryWithRelations = DrugInventory & {
  hospital: Hospital
  drug: Drug & { category: DrugCategory | null }
}

// สถานะสต็อกยา
export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'REORDER' | 'NORMAL'

// ==================== Hospital Types ====================
export type HospitalWhereInput = Prisma.HospitalWhereInput
export type HospitalWithRelations = Hospital & {
  province: Province | null
  facilityType: FacilityType | null
  _count?: { drugInventories: number }
}

// ==================== Province Types ====================
export type ProvinceWhereInput = Prisma.ProvinceWhereInput

// ==================== Drug Category Types ====================
export type DrugCategoryWhereInput = Prisma.DrugCategoryWhereInput

// ==================== Drug Request Types ====================
export type DrugRequestWhereInput = Prisma.DrugRequestWhereInput
export type DrugRequestWithRelations = DrugRequest & {
  hospital: Hospital
  items: Array<{
    id: number
    drugId: number
    quantity: number
    approvedQuantity: number | null
    notes: string | null
    drug: Drug
  }>
}

// ==================== User Types ====================
// UserWhereInput ต้องกำหนดเองเพราะ Prisma type ซับซ้อน
export type UserWhereClause = {
  id?: number
  username?: string
  hospitalId?: number | null
  role?: string
  isActive?: boolean
}

// สำหรับ API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// สำหรับ session user type augmentation
export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
}

// สำหรับ request body validation
export interface CreateDrugRequestItem {
  drugId: number
  quantity: number
  notes?: string | null
}

export interface CreateDrugRequest {
  hospitalId: number
  requiredDate?: string | null
  requestedBy?: string | null
  notes?: string | null
  items: CreateDrugRequestItem[]
}