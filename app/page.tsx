"use client"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import AppLayout from "@/components/layout/app-layout"

export default function Home() {
  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  )
}
