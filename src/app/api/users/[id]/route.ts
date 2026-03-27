import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/users/[id] - ดึงข้อมูลผู้ใช้
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        hospital: { select: { id: true, name: true } },
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - อัปเดตผู้ใช้
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Check if username is taken by another user
    if (body.username && body.username !== existing.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: body.username }
      })
      if (usernameExists) {
        return NextResponse.json(
          { success: false, error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      username: body.username,
      fullName: body.fullName,
      email: body.email || null,
      role: body.role,
      isActive: body.isActive,
    }

    // Hash password if provided
    if (body.password && body.password.length >= 6) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
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
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - ลบผู้ใช้
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Prevent deleting yourself
    if (parseInt(id) === (session.user as any).id) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบบัญชีของตัวเองได้' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' },
      { status: 500 }
    )
  }
}