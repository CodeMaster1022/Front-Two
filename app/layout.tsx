"use client"

import './globals.css'
import { Provider } from "react-redux"
import { store } from "@/lib/store"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SQL Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Provider store={store}>
            {children}
        </Provider>
      </body>
    </html>
  )
}
