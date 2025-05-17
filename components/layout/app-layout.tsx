"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/sidebar"
import ChatPage from "@/components/layout/chat-page"
import { useAppDispatch } from "@/lib/hooks/useAppDispatch"
import { useAppSelector } from "@/lib/hooks/useAppSelector"
import { fetchChatHistory } from "@/lib/features/chat/chatSlice"
import { useMobile } from "@/hooks/use-mobile"
import LoadingScreen from "@/components/loading-screen"
export default function AppLayout() {
  const dispatch = useAppDispatch()
  const { activeThreadId } = useAppSelector((state) => state.chat)
  const [initialLoading, setInitialLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMobile()

  useEffect(() => {
    const loadChatHistory = async () => {
      setInitialLoading(true)
      await dispatch(fetchChatHistory(0))
      setInitialLoading(false)
    }

    loadChatHistory()
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

  if (initialLoading) {
    return <LoadingScreen />
  }
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <ChatPage isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  )
}
