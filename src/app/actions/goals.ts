'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGoals() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        _count: {
          select: {
            progress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const goalsWithLastActivity = await Promise.all(
      goals.map(async (goal) => {
        const lastProgress = await prisma.progressLog.findFirst({
          where: { goalId: goal.id },
          orderBy: { date: 'desc' }
        })

        return {
          ...goal,
          lastActivity: lastProgress?.date || null
        }
      })
    )

    return goalsWithLastActivity
  } catch (error) {
    throw error
  }
}

export async function getGoal(id: number) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        progress: {
          orderBy: {
            date: 'desc'
          }
        },
        _count: {
          select: {
            progress: true
          }
        }
      }
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    const totalHours = goal.progress.reduce((sum: any, log: { hours: unknown }) => sum + (log.hours || 0), 0)

    return {
      ...goal,
      totalHours
    }
  } catch (error) {
    throw error
  }
}

export async function createGoal(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string

    if (!title) {
      throw new Error('Title is required')
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || null,
        status: status || 'active'
      }
    })

    revalidatePath('/')
    return goal
  } catch (error) {
    throw error
  }
}

export async function updateGoal(id: number, formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string

    if(!title){
      throw new Error('title is required')
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        title,
        description: description,
        status: status || 'active'
      }
    })

    revalidatePath('/')
    revalidatePath(`/goals/${id}`)
    return goal
  } catch (error) {
    throw error
  }
}

export async function deleteGoal(id: number) {
  try {
    await prisma.goal.delete({
      where: { id }
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    throw error
  }
}