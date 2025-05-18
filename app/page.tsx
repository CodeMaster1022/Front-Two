"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import AppLayout from "@/components/layout/app-layout"

export default function Home() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  )
}
