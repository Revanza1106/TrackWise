import { redirect } from 'next/navigation'
import { createGoal } from '../../actions/goals'
import GoalForm from '@/components/GoalForm'
import Link from 'next/link'

export default function NewGoalPage() {
  async function handleCreateGoal(formData: FormData) {
    'use server'

    await createGoal(formData)
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Goals
            </Link>
            <h1 className="text-3xl font-bold mt-4">Create New Goal</h1>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <GoalForm onSubmit={handleCreateGoal} />
          </div>
        </div>
      </div>
    </main>
  )
}