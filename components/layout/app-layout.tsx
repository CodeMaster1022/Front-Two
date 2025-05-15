"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/sidebar"
import ChatPage from "@/components/layout/chat-page"
import { useAppDispatch } from "@/lib/hooks/useAppDispatch"
import { useAppSelector } from "@/lib/hooks/useAppSelector"
import { fetchChatHistory } from "@/lib/features/chat/chatSlice"
import { useMobile } from "@/hooks/use-mobile"

export default function AppLayout() {
  const dispatch = useAppDispatch()
  const { activeThreadId } = useAppSelector((state) => state.chat)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMobile()

  useEffect(() => {
    dispatch(fetchChatHistory())
  }, [dispatch])

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <ChatPage isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  )
}
