"use client"

import type React from "react"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { Smartphone, Monitor, Loader2 } from "lucide-react"

interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode
}

export function ResponsiveLayoutWrapper({ children }: ResponsiveLayoutWrapperProps) {
  const { isMobile, isInitialized } = useResponsiveRedirect()

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div
          className="text-center space-y-6"
        >
          <div
            className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Loader2 className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Menyesuaikan Tampilan</h2>
            <p className="text-gray-600 flex items-center justify-center space-x-2">
              <span>Mengoptimalkan untuk</span>
              <div>
                {isMobile ? (
                  <Smartphone className="h-5 w-5 text-blue-500" />
                ) : (
                  <Monitor className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <span>{isMobile ? "Mobile" : "Desktop"}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        key={isMobile ? "mobile" : "desktop"}
      >
        {children}
      </div>
    </>
  )
}
