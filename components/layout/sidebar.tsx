"use client"

import { useState } from "react"
import { useAppDispatch } from "@/lib/hooks/useAppDispatch"
import { useAppSelector } from "@/lib/hooks/useAppSelector"
import { createNewChat, selectChat, deleteThread, updateThreadTitle } from "@/lib/features/chat/chatSlice"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Database,
  MessageSquare,
  Plus,
  Settings,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const dispatch = useAppDispatch()
  const { threads, activeThreadId } = useAppSelector((state) => state.chat)
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleNewChat = () => {
    dispatch(createNewChat())
  }

  const handleSelectChat = (threadId: string) => {
    dispatch(selectChat(threadId))
  }

  const handleEditThread = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId)
    setEditTitle(currentTitle)
  }

  const handleSaveTitle = (threadId: string) => {
    if (editTitle.trim()) {
      dispatch(updateThreadTitle({ threadId, title: editTitle }))
    }
    setEditingThreadId(null)
  }

  const handleCancelEdit = () => {
    setEditingThreadId(null)
  }

  const handleDeleteThread = (threadId: string) => {
    dispatch(deleteThread(threadId))
  }

  // Function to truncate title to a specific length
  const truncateTitle = (title: string, maxLength = 30) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + "..."
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-50 dark:bg-slate-900 shadow-lg transition-transform duration-300 ease-in-out lg:static lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-black" />
            <h1 className="text-lg font-semibold">SQL Assistant</h1>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={toggleSidebar}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button className="w-full justify-start gap-2 bg-black" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 py-2">
            {threads.map((thread) => (
              <div key={thread.id} className="relative">
                {editingThreadId === thread.id ? (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveTitle(thread.id)
                        } else if (e.key === "Escape") {
                          handleCancelEdit()
                        }
                      }}
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleSaveTitle(thread.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {/* Thread content button */}
                    <div
                      className={cn(
                        "flex-1 flex items-start gap-3 py-3 px-3 rounded-md cursor-pointer",
                        thread.id === activeThreadId ? "bg-secondary" : "hover:bg-muted",
                      )}
                      onClick={() => handleSelectChat(thread.id)}
                    >
                      <MessageSquare className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{truncateTitle(thread.title || "New Conversation", 20)}</p>
                        {thread.lastMessage && (
                          <p className="truncate text-xs text-muted-foreground mt-1">
                            {truncateTitle(thread.lastMessage, 20)}
                          </p>
                        )}
                        {thread.updatedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Thread options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 z-50">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditThread(thread.id, thread.title)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit title
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteThread(thread.id)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </>
  )
}
