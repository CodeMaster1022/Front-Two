"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks/useAppSelector"
import { checkAuth } from "@/lib/features/auth/authSlice"
import LoadingScreen from "@/components/loading-screen"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await dispatch(checkAuth()).unwrap()
      } catch (error) {
        // If not on an auth page, redirect to login
        if (pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password") {
          router.push("/login")
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthentication()
  }, [dispatch, router, pathname])

  // Show loading screen while checking authentication
  if (isChecking || isLoading) {
    return <LoadingScreen />
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (isAuthenticated && (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password")) {
    router.push("/")
    return <LoadingScreen />
  }

  // If user is not authenticated and tries to access protected pages, the redirect happens in the useEffect
  // If we're on an auth page or the user is authenticated, render the children
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || isAuthenticated) {
    return <>{children}</>
  }

  // This should not happen due to the redirect in useEffect, but just in case
  return <LoadingScreen />
}
