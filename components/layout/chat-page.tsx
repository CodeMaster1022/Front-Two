"use client"

import { useAppSelector } from "@/lib/hooks/useAppSelector"
import ChatInterface from "@/components/chat-interface"
import EmptyState from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import UserAvatar from "../user-avatar"
interface ChatPageProps {
  isOpen: boolean
  toggleSidebar: () => void
}

export default function ChatPage({ isOpen, toggleSidebar }: ChatPageProps) {
  const { activeThreadId, threads } = useAppSelector((state) => state.chat)

  const activeThread = threads.find((thread) => thread.id === activeThreadId)

  const truncateTitle = (title: string, maxLength = 30) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + "..."
  }
  return (
    <div
      className={cn(
        "flex flex-1 flex-col h-screen transition-all duration-300 ease-in-out",
        isOpen ? "lg:ml-0" : "ml-0",
      )}
    >
      {/* Header */}
      <header className="flex h-14 items-center border-b px-4 lg:px-6 bg-white">
        <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {activeThread ? truncateTitle(activeThread.title || "New Conversation") : "SQL Assistant"}
          </h1>
        </div>
        <UserAvatar />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-0">{activeThreadId ? <ChatInterface /> : <EmptyState />}</main>
    </div>
  )
}
