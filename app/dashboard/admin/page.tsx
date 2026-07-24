"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Eye,
  Shield,
  Database,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { RoleGuard } from "@/components/auth/role-guard"
import { getSubmissions } from "@/lib/api-client"
import { DashboardOverviewStats } from "@/components/dashboard-overview-stats"
import { useToast } from "@/hooks/use-toast"

// Types
interface DashboardStats {
  totalSubmissions: number
  pendingReview: number
  pendingValidation: number
  completed: number
  totalContent: number
  approvedContent: number
  rejectedContent: number
  publishedContent: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingReview: 0,
    pendingValidation: 0,
    completed: 0,
    totalContent: 0,
    approvedContent: 0,
    rejectedContent: 0,
    publishedContent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showStats, setShowStats] = useState(false) // Start with false
  const [isInitialized, setIsInitialized] = useState(false) // Track initialization

  // Debug showStats changes
  useEffect(() => {
    console.log("showStats changed to:", showStats);
  }, [showStats]);

  // Set default showStats based on device type (only once)
  useEffect(() => {
    if (!isInitialized) {
      if (isMobile) {
        setShowStats(false) // Hidden by default on mobile
      } else {
        setShowStats(true) // Shown by default on desktop
      }
      setIsInitialized(true)
    }
  }, [isMobile, isInitialized])

  useEffect(() => {
    if (!authLoading) {
      // Load statistics logic
      const loadStats = async () => {
        try {
          console.log("🔄 Loading dashboard stats from API...")
          
          // Get submissions from server
          // Get submissions from api client (handles mock fallback)
          const apiData = await getSubmissions()
          
          if (apiData.success && apiData.data) {
            console.log("✅ API Response received:", apiData)
            
            let submissions = Array.isArray(apiData.data) ? apiData.data : ((apiData.data as any)?.data || [])
            console.log("📊 Processing stats for submissions:", submissions.length)
            
            // Calculate stats based on API or Mock response structure
            const totalSubmissions = submissions.length
            
            // Count by workflow_stage or workflowStage
            const pendingReview = submissions.filter((s: any) => (s.workflow_stage || s.workflowStage) === "review").length
            const pendingValidation = submissions.filter((s: any) => (s.workflow_stage || s.workflowStage) === "validation").length  
            const completed = submissions.filter((s: any) => (s.workflow_stage || s.workflowStage) === "completed").length
            
            // Count content items (handles content_items or contentItems)
            const allContent = submissions.flatMap((s: any) => s.content_items || s.contentItems || [])
            const totalContent = allContent.length
            const approvedContent = allContent.filter((c: any) => c.is_published === true || c.isTayang === true || c.status === "approved").length
            const rejectedContent = allContent.filter((c: any) => c.is_published === false || c.status === "rejected").length
            const publishedContent = allContent.filter((c: any) => c.is_published === true || c.isTayang === true).length

            const calculatedStats = {
              totalSubmissions,
              pendingReview,
              pendingValidation,
              completed,
              totalContent,
              approvedContent,
              rejectedContent,
              publishedContent,
            }
            
            console.log("📈 Calculated stats:", calculatedStats)
            setStats(calculatedStats)
          } else {
            throw new Error(`API request failed`)
          }
        } catch (error) {
          console.error("❌ Error loading stats from server:", error)
          
          // Fallback to empty stats on error
          setStats({
            totalSubmissions: 0,
            pendingReview: 0,
            pendingValidation: 0,
            completed: 0,
            totalContent: 0,
            approvedContent: 0,
            rejectedContent: 0,
            publishedContent: 0,
          })
        } finally {
          setIsLoading(false)
        }
      }
      loadStats()
    }
  }, [authLoading])

  const refreshStats = async () => {
    setIsLoading(true)
    
    try {
      console.log("🔄 Refreshing dashboard stats...")
      
      const apiData = await getSubmissions()
      
      if (apiData.success && apiData.data) {
        let submissions = Array.isArray(apiData.data) ? apiData.data : ((apiData.data as any)?.data || [])
        console.log("🔄 Refreshed stats for submissions:", submissions.length)
        
        const totalSubmissions = submissions.length
        const pendingReview = submissions.filter((s: any) => (s.workflow_stage || s.workflowStage) === "review").length
        const pendingValidation = submissions.filter((s: any) => (s.workflow_stage || s.workflowStage) === "validation").length
        const completed = submissions.filter((s: any) => (s.workflow_stage || s.workflowStage) === "completed").length
        
        const allContent = submissions.flatMap((s: any) => s.content_items || s.contentItems || [])
        const totalContent = allContent.length
        const approvedContent = allContent.filter((c: any) => c.is_published === true || c.isTayang === true || c.status === "approved").length
        const rejectedContent = allContent.filter((c: any) => c.is_published === false || c.status === "rejected").length  
        const publishedContent = allContent.filter((c: any) => c.is_published === true || c.isTayang === true).length

        setStats({
          totalSubmissions,
          pendingReview,
          pendingValidation,
          completed,
          totalContent,
          approvedContent,
          rejectedContent,
          publishedContent,
        })
        
        console.log("✅ Stats refreshed successfully")
      }
    } catch (error) {
      console.error("❌ Error refreshing stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(isMobile ? "/mobile" : "/desktop")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-indigo-700">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <RoleGuard allowedRoles={["superadmin", "admin", "review", "validasi", "rekap"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl"
            />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"
            />
            <div
              className="absolute top-1/2 right-1/4 w-4 h-4 bg-indigo-400/30 rounded-full"
            />
            <div
              className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-400/40 rounded-full"
            />
          </div>
          {/* Header */}
          <header
            className="z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-3 flex-1"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 p-2"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <div
                      className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Dashboard
                      </h1>
                      <p className="text-xs text-gray-600">Selamat datang, {user?.name || "Administrator"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("📱 Mobile Overview button clicked, current showStats:", showStats);
                        const newState = !showStats;
                        setShowStats(newState);
                        console.log("📱 Mobile Overview set to:", newState);
                        
                        // Show notification
                        toast({
                          title: newState ? "Overview Ditampilkan" : "Overview Disembunyikan",
                          description: newState ? "Statistik overview sekarang ditampilkan." : "Statistik overview sekarang disembunyikan.",
                          variant: "default",
                        });
                      }}
                      className={`p-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        showStats 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                      }`}
                      title={showStats ? "Sembunyikan Statistik" : "Tampilkan Statistik"}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("📱 Mobile Refresh button clicked");
                        refreshStats();
                        
                        // Show success notification
                        toast({
                          title: "Data Diperbarui",
                          description: "Statistik dashboard telah berhasil diperbarui.",
                          variant: "default",
                        });
                      }}
                      disabled={isLoading}
                      className="p-2 bg-green-600 text-white rounded-lg border border-green-600 hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="Refresh Data"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 mr-6"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Kembali
                  </Button>
                </div>
                <div
                  className="flex items-center space-x-4 flex-1"
                >
                  <div
                    className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <Shield className="h-8 w-8 text-white relative z-10" />
                    <div
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                    />
                  </div>
                  <div>
                    <h1
                      className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1"
                    >
                      Dashboard Workflow
                    </h1>
                    <div
                      className="flex items-center space-x-2"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <p className="text-gray-600 font-medium">Selamat datang, {user?.username || "Administrator"}</p>
                      <div
                      >
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🔄 Overview button clicked, current showStats:", showStats);
                      const newState = !showStats;
                      setShowStats(newState);
                      console.log("🔄 Overview set to:", newState);
                      
                      // Show notification
                      toast({
                        title: newState ? "Overview Ditampilkan" : "Overview Disembunyikan",
                        description: newState ? "Statistik overview sekarang ditampilkan." : "Statistik overview sekarang disembunyikan.",
                        variant: "default",
                      });
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      showStats 
                        ? "bg-blue-600 text-white border-blue-600" 
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <BarChart3 className="h-4 w-4" />
                    {showStats ? "Sembunyikan Overview" : "Tampilkan Overview"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🔄 Refresh button clicked");
                      refreshStats();
                      
                      // Show success notification
                      toast({
                        title: "Data Diperbarui",
                        description: "Statistik dashboard telah berhasil diperbarui.",
                        variant: "default",
                      });
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg border-2 border-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Overview Statistics - Using Dedicated Component */}
            <>
              {showStats && (
                <DashboardOverviewStats 
                  key="overview-stats"
                  stats={stats} 
                  isLoading={isLoading}
                />
              )}
            </>


            {/* Workflow Management */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Render cards based on user role */}
              {user?.role === "superadmin" && (
                <>
                  {/* Review Content */}
                  <div>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/review")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-blue-900">Review Konten</CardTitle>
                              <p className="text-sm text-blue-700">Tinjau pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Review</span>
                            <span className="text-sm font-medium">{stats.pendingReview}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Validation Content */}
                  <div>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/validasi")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-pink-900">Validasi Konten</CardTitle>
                              <p className="text-sm text-pink-700">Validasi pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Validation</span>
                            <span className="text-sm font-medium">{stats.pendingValidation}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Recap Content */}
                  <div>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/rekap")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Database className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-green-900">Rekap Konten</CardTitle>
                              <p className="text-sm text-green-700">Rekap pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-medium">{stats.completed}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  {/* Review Content */}
                  <div>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/review")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-blue-900">Review Konten</CardTitle>
                              <p className="text-sm text-blue-700">Tinjau pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Review</span>
                            <span className="text-sm font-medium">{stats.pendingReview}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Validation Content */}
                  <div>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/validasi")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-pink-900">Validasi Konten</CardTitle>
                              <p className="text-sm text-pink-700">Validasi pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Validation</span>
                            <span className="text-sm font-medium">{stats.pendingValidation}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Recap Content */}
                  <div>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/rekap")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Database className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-green-900">Rekap Konten</CardTitle>
                              <p className="text-sm text-green-700">Rekap pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-medium">{stats.completed}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
              {user?.role === "review" && (
                <div>
                  {/* Review Content */}
                  <Card
                    className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push("/dashboard/admin/review")}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-blue-900">Review Konten</CardTitle>
                            <p className="text-sm text-blue-700">Tinjau pengajuan masuk</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending Review</span>
                          <span className="text-sm font-medium">{stats.pendingReview}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {user?.role === "validasi" && (
                <div>
                  {/* Validation Content */}
                  <Card
                    className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push("/dashboard/admin/validasi")}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-pink-900">Validasi Konten</CardTitle>
                            <p className="text-sm text-pink-700">Validasi pengajuan masuk</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending Validation</span>
                          <span className="text-sm font-medium">{stats.pendingValidation}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {user?.role === "rekap" && (
                <div>
                  {/* Recap Content */}
                  <Card
                    className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push("/dashboard/admin/rekap")}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <Database className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-green-900">Rekap Konten</CardTitle>
                            <p className="text-sm text-green-700">Rekap pengajuan masuk</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="text-sm font-medium">{stats.completed}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </RoleGuard>
    </>
  )
}
