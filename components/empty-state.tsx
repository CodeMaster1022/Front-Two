"use client"

import { useAppDispatch } from "@/lib/hooks/useAppDispatch"
import { createNewChat } from "@/lib/features/chat/chatSlice"
import { Button } from "@/components/ui/button"
import { Database, Plus } from "lucide-react"

export default function EmptyState() {
  const dispatch = useAppDispatch()

  const handleNewChat = () => {
    dispatch(createNewChat())
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Database className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">SQL Assistant</h2>
        <p className="max-w-md text-muted-foreground">
          Ask questions about your data in natural language and get SQL queries and results instantly.
        </p>
        <Button onClick={handleNewChat} className="mt-2 gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Query your data</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions like "How many orders were placed last month?"
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Get SQL explanations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            See the SQL query that powers your results and learn from it.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Follow-up questions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Refine your queries with follow-up questions for deeper insights.
          </p>
        </div>
      </div>
    </div>
  )
}
