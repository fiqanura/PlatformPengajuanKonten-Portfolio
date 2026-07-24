"use client"
import { ChevronLeft, Crown, Sparkles } from "lucide-react"

interface MobileFormHeaderProps {
  isEditMode: boolean
  onBackToHome: () => void
}

export const MobileFormHeader = ({ isEditMode, onBackToHome }: MobileFormHeaderProps) => {
  return (
    <div
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={onBackToHome}
              className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              title="Kembali ke beranda"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            <div
              className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {isEditMode ? "Edit Pengajuan" : "Form Pengajuan"}
              </h1>
              <p
                className="text-sm text-gray-600 flex items-center"
              >
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                Pelayanan Publik Mobile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
