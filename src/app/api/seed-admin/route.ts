import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/seed-admin - สร้าง admin user เริ่มต้น
export async function POST() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        data: {
          username: 'admin',
          password: 'admin123'
        }
      })
    }

    // Create admin user with hashed password
    const hashedAdminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedAdminPassword,
        fullName: 'System Administrator',
        email: 'admin@pharmacy.local',
        role: 'ADMIN',
        isActive: true
      }
    })

    // Create default pharmacist user with hashed password
    const existingPharmacist = await prisma.user.findUnique({
      where: { username: 'pharmacist' }
    })

    if (!existingPharmacist) {
      const hashedPharmPassword = await bcrypt.hash('pharm123', 10)
      await prisma.user.create({
        data: {
          username: 'pharmacist',
          password: hashedPharmPassword,
          fullName: 'เภสัชกร ทดสอบ',
          email: 'pharmacist@pharmacy.local',
          role: 'PHARMACIST',
          isActive: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Created default users',
      data: {
        admin: { username: 'admin', password: 'admin123' },
        pharmacist: { username: 'pharmacist', password: 'pharm123' }
      }
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    )
  }
}