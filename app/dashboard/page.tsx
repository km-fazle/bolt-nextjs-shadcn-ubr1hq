"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'
import EmployeeDashboard from '@/components/EmployeeDashboard'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div>
      {session?.user?.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  )
}