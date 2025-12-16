import Link from 'next/link'
import { getGoals } from './actions/goals'
import GoalForm from '@/components/GoalForm'

export default async function Home() {
  const goals = await getGoals()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Trackwise</h1>
          <Link
            href="/goals/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            New Goal
          </Link>
      </div>

        <div className="grid gap-6">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No goals yet</h2>
              <p className="text-muted-foreground mb-6">
                Start tracking your learning journey by creating your first goal.
              </p>
              <Link
                href="/goals/new"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create Your First Goal
              </Link>
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <Link
                        href={`/goals/${goal.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {goal.title}
                      </Link>
                    </h3>
                    {goal.description && (
                      <p className="text-muted-foreground mb-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : goal.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{goal._count.progress} progress entries</span>
                  {goal.lastActivity && (
                    <span>• Last activity: {new Date(goal.lastActivity).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}