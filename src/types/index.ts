export interface Goal {
  id: number
  title: string
  description?: string | null
  status: 'active' | 'paused' | 'done'
  createdAt: Date
  _count?: {
    progress: number
  }
}

export interface ProgressLog {
  id: number
  goalId: number
  date: Date
  note: string
  hours?: number | null
}

export interface GoalWithStats extends Goal {
  _count: {
    progress: number
  }
  progress: ProgressLog[]
  totalHours?: number
  lastActivity?: Date | null
}