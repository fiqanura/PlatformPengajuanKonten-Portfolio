"use client"
import { ArrowLeftIcon, ArrowRightIcon, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  isNextDisabled: boolean
  isSubmitDisabled: boolean
  isSubmitting: boolean
  isEditMode: boolean
}

export const MobileBottomNav = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isNextDisabled,
  isSubmitDisabled,
  isSubmitting,
  isEditMode,
}: MobileBottomNavProps) => {
  const canGoBack = currentStep > 1
  const canGoNext = currentStep < totalSteps && !isNextDisabled
  const canSubmit = currentStep === totalSteps && !isSubmitDisabled

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 p-4 safe-area-pb shadow-2xl z-50"
    >
      <div className="flex items-center justify-between space-x-4">
        {/* Back Button */}
        <button
          onClick={onPrev}
          disabled={!canGoBack}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300",
            !canGoBack
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 shadow-md hover:shadow-lg",
          )}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        {/* Next/Submit Button */}
        {currentStep < totalSteps ? (
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              "flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden",
              !canGoNext
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl",
            )}
          >
            {canGoNext && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              />
            )}
            <span className="relative">Lanjutkan</span>
            <ArrowRightIcon className="h-4 w-4 relative" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className={cn(
              "flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden",
              !canSubmit || isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl",
            )}
          >
            {canSubmit && !isSubmitting && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              />
            )}
            {isSubmitting ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                <span className="relative">Mengirim...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 relative" />
                <span className="relative">{isEditMode ? "Update" : "Kirim"}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Step Progress Indicator */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep

            return (
              <div
                key={stepNumber}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isActive ? "bg-blue-500 scale-125" : isCompleted ? "bg-green-500" : "bg-gray-300",
                )}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
