import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { timesheets: true }
      }
    }
  })

  const employeesWithTotalHours = await Promise.all(employees.map(async (employee) => {
    const totalHours = await prisma.timesheet.aggregate({
      where: { userId: employee.id },
      _sum: { hours: true }
    })

    return {
      ...employee,
      totalHours: totalHours._sum.hours || 0
    }
  }))

  return NextResponse.json(employeesWithTotalHours)
}