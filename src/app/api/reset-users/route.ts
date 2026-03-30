import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/reset-users - ลบ users เก่าและสร้างใหม่พร้อม hash password
export async function POST() {
  try {
    // Delete all existing users
    await prisma.user.deleteMany({})

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

    // Create pharmacist user with hashed password
    const hashedPharmPassword = await bcrypt.hash('pharm123', 10)
    const pharmacist = await prisma.user.create({
      data: {
        username: 'pharmacist',
        password: hashedPharmPassword,
        fullName: 'เภสัชกร ทดสอบ',
        email: 'pharmacist@pharmacy.local',
        role: 'PHARMACIST',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Users reset successfully',
      data: {
        admin: { username: 'admin', password: 'admin123', role: 'ADMIN' },
        pharmacist: { username: 'pharmacist', password: 'pharm123', role: 'PHARMACIST' }
      }
    })
  } catch (error) {
    console.error('Error resetting users:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to reset users',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
