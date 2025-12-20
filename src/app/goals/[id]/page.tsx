import { notFound } from 'next/navigation'
import { getGoal } from '../../actions/goals'
import { addProgressLog, deleteProgressLog } from '../../actions/progress'
import ProgressForm from '@/components/ProgressForm'
import { ProgressInsights } from '@/components/ProgressInsights'
import AIChat from '@/components/AIChat'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GoalDetailPage({ params }: PageProps) {
  const { id } = await params
  const goalId = parseInt(id)

  if (isNaN(goalId)) {
    notFound()
  }

  const goal = await getGoal(goalId)

  async function handleAddProgress(goalId: number, formData: FormData) {
    'use server'
    await addProgressLog(goalId, formData)
  }

  async function handleDeleteProgress(id: number, goalId: number) {
    'use server'
    await deleteProgressLog(id, goalId)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Goals
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{goal.title}</h1>
                {goal.description && (
                  <p className="text-muted-foreground text-lg">
                    {goal.description}
                  </p>
                )}
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  goal.status === 'active'
                    ? 'bg-green-500/10 text-green-700 border border-green-500/20'
                    : goal.status === 'paused'
                    ? 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20'
                    : 'bg-gray-500/10 text-gray-700 border border-gray-500/20'
                }`}
              >
                {goal.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold">{goal._count.progress}</div>
                <div className="text-sm text-muted-foreground">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{goal.totalHours || 0}</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{goal.status}</div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <ProgressInsights goalId={goal.id} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Add Progress</h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <ProgressForm goalId={goal.id} onSubmit={handleAddProgress} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Progress History ({goal.progress.length})
              </h2>
              <div className="space-y-4">
                {goal.progress.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                    No progress entries yet. Add your first progress log!
                  </div>
                ) : (
                  goal.progress.map((log) => (
                    <div
                      key={log.id}
                      className="bg-card border border-border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{log.note}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{new Date(log.date).toLocaleDateString()}</span>
                            {log.hours && <span>{log.hours} hours</span>}
                          </div>
                        </div>
                        <form action={handleDeleteProgress.bind(null, log.id, goal.id)}>
                          <button
                            type="submit"
                            className="text-destructive hover:text-destructive/80 text-sm"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Component */}
      <AIChat goalId={goal.id} goalTitle={goal.title} />
    </main>
  )
}