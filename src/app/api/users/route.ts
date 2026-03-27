import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users - ดึงรายการผู้ใช้
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        hospital: { select: { id: true, name: true } },
        isActive: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  }
}

// POST /api/users - สร้างผู้ใช้ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Check if username exists
    const existing = await prisma.user.findUnique({
      where: { username: body.username }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }

    // Create user (password will be stored as-is for now, in production use bcrypt)
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password, // In production, hash with bcrypt
        fullName: body.fullName,
        email: body.email,
        role: body.role,
        hospitalId: body.hospitalId,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        hospital: { select: { id: true, name: true } },
        isActive: true
      }
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    )
  }
}