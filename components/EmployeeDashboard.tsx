"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from 'next-auth/react'

export default function EmployeeDashboard() {
  const [timesheets, setTimesheets] = useState([])
  const [hours, setHours] = useState('')
  const [date, setDate] = useState('')
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch timesheets data
    const fetchTimesheets = async () => {
      const response = await fetch('/api/timesheets')
      const data = await response.json()
      setTimesheets(data)
    }
    fetchTimesheets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/timesheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours: parseFloat(hours), date }),
    })

    if (response.ok) {
      toast({
        title: "Success",
        description: "Timesheet entry added successfully",
      })
      setHours('')
      setDate('')
      // Refresh timesheets
      const updatedTimesheets = await response.json()
      setTimesheets(updatedTimesheets)
    } else {
      toast({
        title: "Error",
        description: "Failed to add timesheet entry",
        variant: "destructive",
      })
    }
  }

  const totalHours = timesheets.reduce((sum: number, entry: any) => sum + entry.hours, 0)
  const hourlyRate = 15 // Example hourly rate
  const totalWages = totalHours * hourlyRate

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalHours.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Wages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${totalWages.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add Timesheet Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.01"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Entry</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Wages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.hours.toFixed(2)}</TableCell>
                  <TableCell>${(entry.hours * hourlyRate).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4">
        <Button onClick={() => window.print()}>Download PDF</Button>
      </div>
    </div>
  )
}