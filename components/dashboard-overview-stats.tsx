"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Star,
  Sparkles
} from "lucide-react"

interface OverviewStatsProps {
  stats: {
    totalSubmissions: number
    pendingReview: number
    pendingValidation: number
    completed: number
    totalContent: number
    approvedContent: number
    rejectedContent: number
    publishedContent: number
  }
  isLoading?: boolean
}

export function DashboardOverviewStats({ stats, isLoading = false }: OverviewStatsProps) {
  console.log("📊 DashboardOverviewStats rendered with stats:", stats)

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-6 w-6 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold">Loading Overview...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-6 bg-gray-100 rounded-2xl animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className="mb-8"
    >
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"
          />
          <CardTitle className="flex items-center space-x-3 relative z-10">
            <div
              className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
            >
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Overview Statistik Workflow</span>
            <div
            >
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white">
          {/* Submission Statistics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Statistik Pengajuan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-blue-900 mb-1">{stats.totalSubmissions}</p>
                <p className="text-sm text-blue-700 font-medium">Total Pengajuan</p>
              </div>
              
              <div
                className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-orange-900 mb-1">{stats.pendingReview}</p>
                <p className="text-sm text-orange-700 font-medium">Menunggu Review</p>
              </div>
              
              <div
                className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-purple-900 mb-1">{stats.pendingValidation}</p>
                <p className="text-sm text-purple-700 font-medium">Menunggu Validasi</p>
              </div>
              
              <div
                className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-green-900 mb-1">{stats.completed}</p>
                <p className="text-sm text-green-700 font-medium">Selesai</p>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Statistik Konten
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div
                className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Users className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-indigo-900 mb-1">{stats.totalContent}</p>
                <p className="text-sm text-indigo-700 font-medium">Total Konten</p>
              </div>
              
              <div
                className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-emerald-900 mb-1">{stats.approvedContent}</p>
                <p className="text-sm text-emerald-700 font-medium">Konten Disetujui</p>
              </div>
              
              <div
                className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-red-900 mb-1">{stats.rejectedContent}</p>
                <p className="text-sm text-red-700 font-medium">Konten Ditolak</p>
              </div>
              
              <div
                className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Star className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-cyan-900 mb-1">{stats.publishedContent}</p>
                <p className="text-sm text-cyan-700 font-medium">Konten Tayang</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
