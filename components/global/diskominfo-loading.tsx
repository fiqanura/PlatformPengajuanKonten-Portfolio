"use client"
import { Loader2, Sparkles } from "lucide-react"

interface DiskomInfoLoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
  showLogo?: boolean
}

export function DiskomInfoLoading({ message = "Memuat...", size = "md", showLogo = true }: DiskomInfoLoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {showLogo && (
        <div
          className="relative"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div
            className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
          >
            <Loader2 className="h-3 w-3 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div
        >
          <Loader2 className={`${sizeClasses[size]} text-blue-600`} />
        </div>

        <p
          className={`${textSizeClasses[size]} font-medium text-gray-700`}
        >
          {message}
        </p>
      </div>

      <div
        className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full max-w-xs"
      />
    </div>
  )
}

// Named export

// Default export
export default DiskomInfoLoading
