"use client"
import { Star } from "lucide-react"

interface MobileStepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export const MobileStepIndicator = ({ currentStep, totalSteps }: MobileStepIndicatorProps) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 relative overflow-hidden ${
                i + 1 <= currentStep ? "bg-gradient-to-r from-blue-500 to-purple-500 w-12" : "bg-gray-200 w-8"
              }`}
            >
              {i + 1 <= currentStep && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                />
              )}
            </div>
          ))}
        </div>
        <div
          className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full"
        >
          <Star className="h-3 w-3 text-blue-600" />
          <span className="text-sm font-bold text-blue-800">
            {currentStep}/{totalSteps}
          </span>
        </div>
      </div>
    </div>
  )
}
