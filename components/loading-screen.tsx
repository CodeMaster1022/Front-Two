"use client"

import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold">Loading SQL Assistant</h2>
          <p className="text-muted-foreground">Fetching your conversation history...</p>
        </div>

        {/* Loading progress bar with animation */}
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full animate-progress"
            style={{
              animation: "progress 2s ease-in-out infinite",
              width: "0%",
            }}
          />
        </div>
      </div>
    </div>
  )
}
