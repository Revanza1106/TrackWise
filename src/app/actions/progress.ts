'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addProgressLog(goalId: number, formData: FormData) {
  try {
    const note = formData.get('note') as string
    const hours = formData.get('hours') as string
    const date = formData.get('date') as string

    if (!note) {
      throw new Error('Note is required')
    }

    const progressLog = await prisma.progressLog.create({
      data: {
        goalId,
        note,
        hours: hours ? parseFloat(hours) : null,
        date: date ? new Date(date) : new Date()
      }
    })

    revalidatePath(`/goals/${goalId}`)
    revalidatePath('/')
    return progressLog
  } catch (error) {
    throw new Error('Failed to add progress log')
  }
}

export async function getProgressLogs(goalId: number) {
  try {
    const progressLogs = await prisma.progressLog.findMany({
      where: { goalId },
      orderBy: { date: 'desc' }
    })

    return progressLogs
  } catch (error) {
    throw new Error('Failed to fetch progress logs')
  }
}

export async function updateProgressLog(id: number, formData: FormData) {
  try {
    const note = formData.get('note') as string
    const hours = formData.get('hours') as string
    const date = formData.get('date') as string

    if (!note) {
      throw new Error('Note is required')
    }

    const progressLog = await prisma.progressLog.update({
      where: { id },
      data: {
        note,
        hours: hours ? parseFloat(hours) : null,
        date: date ? new Date(date) : new Date()
      }
    })

    // Revalidate the goal page since we don't have goalId here
    // This will be handled client-side with proper goalId
    return progressLog
  } catch (error) {
    throw new Error('Failed to update progress log')
  }
}

export async function deleteProgressLog(id: number, goalId: number) {
  try {
    await prisma.progressLog.delete({
      where: { id }
    })

    revalidatePath(`/goals/${goalId}`)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    throw new Error('Failed to delete progress log')
  }
}