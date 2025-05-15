"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useAppDispatch } from "@/lib/hooks/useAppDispatch"
import { useAppSelector } from "@/lib/hooks/useAppSelector"
import { sendQuestion, pollForResponse, setCurrentQuestion } from "@/lib/features/chat/chatSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import ChatMessage from "@/components/chat-message"

export default function ChatInterface() {
  const dispatch = useAppDispatch()
  const { threads, activeThreadId, currentQuestion, isLoading, error, currentTaskId, pollingActive } = useAppSelector(
    (state) => state.chat,
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeThread = threads.find((thread) => thread.id === activeThreadId)
  const messages = activeThread?.messages || []

  // Set up polling mechanism
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null

    if (pollingActive && currentTaskId) {
      pollingInterval = setInterval(() => {
        dispatch(pollForResponse(currentTaskId))
      }, 1000) // Poll every second
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingActive, currentTaskId, dispatch])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeThreadId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentQuestion.trim() || !activeThreadId) return

    const newQuestion = {
      question: currentQuestion,
      user_id: 0,
      thread_id: activeThreadId,
      parent_id: "string",
    }

    dispatch(sendQuestion(newQuestion))
    dispatch(setCurrentQuestion(""))
  }

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(setCurrentQuestion(suggestion))
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] border rounded-lg overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((message, index) => (
          <ChatMessage key={message.id || index} message={message} onSuggestionClick={handleSuggestionClick} />
        ))}

        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Processing your query...</span>
          </div>
        )}

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 md:p-4 flex gap-2 bg-white">
        <Input
          ref={inputRef}
          value={currentQuestion}
          onChange={(e) => dispatch(setCurrentQuestion(e.target.value))}
          placeholder="Ask a question about your data..."
          className="flex-1 border-muted-foreground/20"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !currentQuestion.trim()}
          size="icon"
          className="rounded-full h-10 w-10"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
