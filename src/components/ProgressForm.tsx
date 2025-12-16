'use client'

import { useState } from 'react'

interface ProgressFormProps {
  goalId: number
  onSubmit: (goalId: number, formData: FormData) => Promise<void>
}

export default function ProgressForm({ goalId, onSubmit }: ProgressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if(isSubmitting){
      return
    }

    setIsSubmitting(true)

    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      await onSubmit(goalId, formData)
      form.reset()
    } catch (error) {
      alert('Error adding progress. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-2">
          Note *
        </label>
        <textarea
          id="note"
          name="note"
          required
          rows={3}
          placeholder="What did you work on?"
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="hours" className="block text-sm font-medium mb-2">
            Hours (optional)
          </label>
          <input
            type="number"
            id="hours"
            name="hours"
            min="0"
            step="0.5"
            placeholder="2.5"
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Progress'}
      </button>
    </form>
  )
}