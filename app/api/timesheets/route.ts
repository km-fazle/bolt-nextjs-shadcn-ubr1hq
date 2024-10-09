import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const timesheets = await prisma.timesheet.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(timesheets)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { hours, date } = await request.json()

  const newTimesheet = await prisma.timesheet.create({
    data: {
      hours: parseFloat(hours),
      date: new Date(date),
      userId: session.user.id
    }
  })

  const updatedTimesheets = await prisma.timesheet.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(updatedTimesheets)
}