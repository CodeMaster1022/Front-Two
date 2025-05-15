"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks/useAppDispatch"
import { useAppSelector } from "@/lib/hooks/useAppSelector"
import { pollForResponse } from "@/lib/features/chat/chatSlice"

export function useChatPolling() {
  const dispatch = useAppDispatch()
  const { pollingActive, currentTaskId } = useAppSelector((state) => state.chat)

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
}
