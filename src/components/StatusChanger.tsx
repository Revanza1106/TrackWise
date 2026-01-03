'use client'

import { useState, useTransition } from 'react'
import { updateGoalStatus } from '@/app/actions/goals'

interface StatusChangerProps {
  goalId: number
  currentStatus: string
}

const statuses = [
  { value: 'active', label: 'Active', color: 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20' },
  { value: 'done', label: 'Done', color: 'bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20' },
]

export default function StatusChanger({ goalId, currentStatus }: StatusChangerProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const currentStatusInfo = statuses.find(s => s.value === status) || statuses[0]

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      await updateGoalStatus(goalId, newStatus)
      setStatus(newStatus)
      setIsOpen(false)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`px-4 py-2 rounded-full text-sm font-medium capitalize border transition-all ${currentStatusInfo.color} ${isPending ? 'opacity-50' : ''}`}
      >
        {isPending ? 'Updating...' : currentStatusInfo.label}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[150px]">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={`w-full text-left px-4 py-2 text-sm capitalize transition-colors ${
                  s.value === status
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
