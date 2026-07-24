import { loadSubmissionsFromStorage, saveSubmissionsToStorage } from "./utils"

// API Configuration from Environment Variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-savana.budiutamamandiri.com/api"
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000")
const API_RETRY_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || "3")

// Auth Configuration
const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "auth_token"
const USER_STORAGE_KEY = process.env.NEXT_PUBLIC_USER_STORAGE_KEY || "user"

// Debug Configuration
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === "true"
const DEBUG_AUTH = process.env.NEXT_PUBLIC_DEBUG_AUTH === "true"

// API Endpoints
const ENDPOINTS = {
  AUTH_LOGIN: process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT || "/auth/login",
  AUTH_LOGOUT: process.env.NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT || "/auth/logout",
  AUTH_ME: process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT || "/auth/me",
  SUBMISSIONS: process.env.NEXT_PUBLIC_SUBMISSIONS_ENDPOINT || "/submissions",
  REVIEWS: process.env.NEXT_PUBLIC_REVIEWS_ENDPOINT || "/reviews",
  VALIDATIONS: process.env.NEXT_PUBLIC_VALIDATIONS_ENDPOINT || "/validations",
  USERS: process.env.NEXT_PUBLIC_USERS_ENDPOINT || "/users",
}

// Types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Backend API Response Types (matching your actual API)
interface BackendLoginResponse {
  message: string
  token: string
  user: BackendUser
}

interface BackendUser {
  id: number
  name: string
  email: string
  username: string
  email_verified_at: string
  role: string
  created_at: string
  updated_at: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface User {
  id: string
  username: string
  email: string
  role: "admin" | "user" | "reviewer" | "validator" | "superadmin" | "form" | "review" | "validasi" | "rekap"
  name: string
}

interface ReviewData {
  status: "approved" | "rejected"
  notes: string
  reviewerId: string
  contentItems?: Array<{
    id: string
    status: "approved" | "rejected" | "pending"
    notes?: string
    processedAt?: string
  }>
}

interface ValidationData {
  validation_status?: "setuju" | "ditolak"
  status?: "validated" | "published" | "rejected"
  notes: string | null
  validatorId?: string
  publishDate?: string // Format: YYYY-MM-DD (date format as per API schema)
  publishedContent?: {
    platform?: string
    scheduled?: boolean
    validatedAt?: string
    [key: string]: any
  }
}

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null
  private timeout: number
  private retryAttempts: number

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.timeout = API_TIMEOUT
    this.retryAttempts = API_RETRY_ATTEMPTS
    this.token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null
    
    if (DEBUG_API) {
      console.log("🔧 ApiClient initialized:", {
        baseURL: this.baseURL,
        timeout: this.timeout,
        retryAttempts: this.retryAttempts,
        hasToken: !!this.token
      })
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      credentials: 'omit', // Don't send credentials for cross-origin requests
      mode: 'cors',
      signal: AbortSignal.timeout(this.timeout), // Add timeout
      ...options,
    }

    try {
      // Always log for validation debugging
      console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`)
      console.log("📤 Request headers:", config.headers)
      console.log("🔑 Token available:", this.token ? 'Yes' : 'No')
      if (this.token) {
        console.log("🔑 Authorization header will be:", `Bearer ${this.token}`)
      }
      
      if (DEBUG_API) {
        console.log("📤 Full Request config:", config)
      }
      
      // PORTFOLIO MODE: Force network failure to use mock data
      console.warn(`[PORTFOLIO MODE] Simulating network failure for ${url} to use dummy data`);
      throw new Error("Offline mode for portfolio");
    } catch (error) {
      console.error(`💥 API request to ${endpoint} failed:`, error)
      throw error
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.request<BackendLoginResponse>(ENDPOINTS.AUTH_LOGIN, {
        method: "POST",
        body: JSON.stringify(credentials),
      })

      if (response.success && response.data?.token) {
        this.token = response.data.token
        
        // Convert backend user format to frontend user format
        const backendUser = response.data.user
        const frontendUser: User = {
          id: backendUser.id.toString(),
          username: backendUser.username,
          email: backendUser.email,
          role: this.mapBackendRole(backendUser.role),
          name: backendUser.name
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_TOKEN_KEY, response.data.token)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(frontendUser))
        }

        if (DEBUG_AUTH) {
          console.log("🔐 Login successful:", { user: frontendUser, hasToken: !!response.data.token })
        }

        return {
          success: true,
          data: { user: frontendUser, token: response.data.token },
          message: response.data.message
        }
      }

      return response as any
    } catch (error) {
      if (DEBUG_AUTH) {
        console.warn("🔒 API login failed, using mock authentication:", error)
      }
      
      // Mock user roles based on username for development
      let mockRole: User["role"] = "user"
      let mockName = "User"
      
      if (credentials.username === "superadmin") {
        mockRole = "superadmin"
        mockName = "Super Administrator"
      } else if (credentials.username === "admin") {
        mockRole = "admin"
        mockName = "Administrator"
      } else if (credentials.username === "form" || credentials.username === "form_user") {
        mockRole = "form"
        mockName = "Form User"
      } else if (credentials.username === "review" || credentials.username === "reviewer") {
        mockRole = "review"
        mockName = "Reviewer"
      } else if (credentials.username === "validasi" || credentials.username === "validator") {
        mockRole = "validasi"
        mockName = "Validator"
      } else if (credentials.username === "rekap" || credentials.username === "rekap_user") {
        mockRole = "rekap"
        mockName = "Rekap User"
      }
      
      // Fallback for development
      const mockUser: User = {
        id: "1",
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: mockRole,
        name: mockName,
      }

      const mockToken = "mock-jwt-token"
      this.token = mockToken

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN_KEY, mockToken)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser))
      }

      return {
        success: true,
        data: { user: mockUser, token: mockToken }
      }
    }
  }

  // Helper method to map backend roles to frontend roles
  private mapBackendRole(backendRole: string): User["role"] {
    const roleMapping: Record<string, User["role"]> = {
      'admin': 'admin',
      'superadmin': 'superadmin', 
      'form': 'form',
      'review': 'review',
      'validasi': 'validasi',
      'rekap': 'rekap',
      'user': 'user',
      'reviewer': 'reviewer',
      'validator': 'validator'
    }
    
    return roleMapping[backendRole] || 'user'
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request(ENDPOINTS.AUTH_LOGOUT, { method: "POST" })

      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
      }

      if (DEBUG_AUTH) {
        console.log("🔓 Logout successful")
      }

      return response
    } catch (error) {
      if (DEBUG_AUTH) {
        console.warn("🔒 API logout failed, clearing local storage anyway:", error)
      }
      // Always succeed for logout
      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
      }

      return { success: true }
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.request<BackendUser>(ENDPOINTS.AUTH_ME)
      
      if (response.success && response.data) {
        // Convert backend user format to frontend user format
        const backendUser = response.data
        const frontendUser: User = {
          id: backendUser.id.toString(),
          username: backendUser.username,
          email: backendUser.email,
          role: this.mapBackendRole(backendUser.role),
          name: backendUser.name
        }

        if (DEBUG_AUTH) {
          console.log("👤 Current user fetched:", frontendUser)
        }
        
        return {
          success: true,
          data: frontendUser
        }
      }
      
      return response as any
    } catch (error) {
      if (DEBUG_AUTH) {
        console.warn("👤 API getCurrentUser failed, using stored user:", error)
      }
      // Fallback to stored user
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)
        if (storedUser) {
          return {
            success: true,
            data: JSON.parse(storedUser),
          }
        }
      }

      // Return mock user if no stored user
      return {
        success: true,
        data: {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          name: "Admin User",
        },
      }
    }
  }

  // Submission methods
  async getSubmissions(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    
    try {
      console.log("🔄 Fetching submissions from backend server...")
      const response = await this.request<any[]>(`${ENDPOINTS.SUBMISSIONS}${queryParams}`)
      
      // Cache successful response to localStorage for offline access
      if (response.success && response.data) {
        saveSubmissionsToStorage(response.data)
        console.log("✅ Submissions fetched from server and cached locally")
      }
      
      return response
    } catch (error) {
      console.error("❌ Failed to fetch submissions from server:", error)
      
      // Only use localStorage as last resort with clear indication
      console.warn("⚠️ Using cached local data as fallback (server unavailable)")
      const submissions = loadSubmissionsFromStorage()
      
      return {
        success: true, // Mark as success for portfolio mock mode
        data: submissions,
        message: "Using mock data - portfolio mode"
      }
    }
  }

  async getSubmission(id: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Fetching submission ${id} from backend server...`)
      const response = await this.request<any>(`${ENDPOINTS.SUBMISSIONS}/${id}`)
      
      if (response.success) {
        console.log(`✅ Submission ${id} fetched from server`)
      }
      
      return response
    } catch (error) {
      console.error(`❌ Failed to fetch submission ${id} from server:`, error)
      
      // Only use localStorage as last resort
      console.warn(`⚠️ Searching cached local data for submission ${id}`)
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: true, // Mark as success for portfolio mock mode
          data: submission,
          message: "Using mock data - portfolio mode"
        }
      }

      throw new Error("Submission not found in server or cache")
    }
  }

  async createSubmission(data: any): Promise<ApiResponse<any>> {
    try {
      console.log("🔄 Creating submission locally (Mock Mode)...")
      
      const submissions = loadSubmissionsFromStorage()
      const newSubmission = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: data.status || "pending",
        reviewStatus: "pending",
      }
      
      if (Array.isArray(submissions)) {
        submissions.push(newSubmission)
        saveSubmissionsToStorage(submissions)
      } else {
        saveSubmissionsToStorage([newSubmission])
      }
      
      return {
        success: true,
        data: newSubmission,
        message: "Submission created locally"
      }
    } catch (error) {
      console.error("❌ Failed to create submission locally:", error)
      return {
        success: false,
        message: "Failed to save data locally"
      }
    }
  }

  async updateSubmission(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Updating submission ${id} locally (Mock Mode)...`)
      
      const submissions = loadSubmissionsFromStorage()
      if (Array.isArray(submissions)) {
        const index = submissions.findIndex((s: any) => s.id.toString() === id)
        if (index !== -1) {
          submissions[index] = {
            ...submissions[index],
            ...data,
            updatedAt: new Date().toISOString(),
          }
          saveSubmissionsToStorage(submissions)
          
          return {
            success: true,
            data: submissions[index],
            message: "Submission updated locally"
          }
        }
      }
      
      throw new Error("Submission not found")
    } catch (error) {
      console.error(`❌ Failed to update submission ${id} locally:`, error)
      return {
        success: false,
        message: "Failed to update data locally"
      }
    }
  }

  async deleteSubmission(id: string): Promise<ApiResponse> {
    try {
      console.log(`🔄 Deleting submission ${id} locally (Mock Mode)...`)
      
      const submissions = loadSubmissionsFromStorage()
      if (Array.isArray(submissions)) {
        const filteredSubmissions = submissions.filter((s: any) => s.id.toString() !== id)
        saveSubmissionsToStorage(filteredSubmissions)
      }
      
      return {
        success: true,
        message: "Submission deleted locally"
      }
    } catch (error) {
      console.error(`❌ Failed to delete submission ${id} locally:`, error)
      return {
        success: false,
        message: "Failed to delete data locally"
      }
    }
  }

  // Review methods
  async getReviews(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    
    try {
      console.log("🔄 Fetching reviews from backend server...")
      const response = await this.request<any[]>(`${ENDPOINTS.REVIEWS}${queryParams}`)
      
      if (response.success) {
        console.log("✅ Reviews fetched from server")
      }
      
      return response
    } catch (error) {
      console.error("❌ Failed to fetch reviews from server:", error)
      
      // Only use localStorage as last resort with clear indication
      console.warn("⚠️ Using cached local data for reviews (server unavailable)")
      const submissions = loadSubmissionsFromStorage()
      const reviewItems = submissions.filter((s: any) => {
        // Include submissions that are confirmed and have content items
        return s.isConfirmed && s.contentItems && s.contentItems.length > 0
      })

      return {
        success: true, // Mark as success for portfolio mock mode
        data: reviewItems,
        message: "Using mock data - portfolio mode"
      }
    }
  }

  async getReview(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`${ENDPOINTS.REVIEWS}/${id}`)
    } catch (error) {
      console.warn(`API getReview failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: true,
          data: submission,
        }
      }

      throw new Error("Review not found")
    }
  }

  async submitReview(id: string, reviewData: ReviewData): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Submitting review for ID ${id} locally (Mock Mode)...`)
      
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        submissions[index] = {
          ...submissions[index],
          reviewStatus: reviewData.status,
          reviewNotes: reviewData.notes,
          reviewedBy: reviewData.reviewerId,
          reviewedAt: new Date().toISOString(),
          workflowStage: reviewData.status === "approved" ? "validation" : "completed",
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
          message: "Review saved locally"
        }
      }

      throw new Error("Review not found")
    } catch (error) {
      console.error(`❌ Failed to submit review for ID ${id} locally:`, error)
      return {
        success: false,
        message: "Failed to save review locally"
      }
    }
  }

  async assignReview(id: string, assigneeId: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`${ENDPOINTS.REVIEWS}/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ assigneeId }),
      })
    } catch (error) {
      console.warn(`API assignReview failed for ID ${id}, using local storage`)
      // Fallback to local storage update
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        submissions[index] = {
          ...submissions[index],
          assignedTo: assigneeId,
          assignedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
        }
      }

      throw new Error("Review not found")
    }
  }

  // Validation methods
  async getValidations(filters?: any): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
      const response = await this.request<any>(`${ENDPOINTS.VALIDATIONS}${queryParams}`)
      
      if (DEBUG_API) {
        console.log("🔍 Raw validation response:", response)
      }
      
      // Handle paginated response structure
      if (response.success && response.data) {
        // If data has pagination structure, extract the data array
        if (response.data.data && Array.isArray(response.data.data)) {
          return {
            success: true,
            data: response.data // Return the full pagination object
          }
        } else if (Array.isArray(response.data)) {
          return {
            success: true,
            data: response.data
          }
        }
      }
      
      return response
    } catch (error) {
      console.warn("API getValidations failed, using local submissions data")
      // Fallback to submissions that need validation
      const submissions = loadSubmissionsFromStorage()
      const validationItems = submissions.filter((s: any) => {
        // Include submissions that are approved for review or in validation stage
        return (
          (s.workflowStage === "validation" || s.reviewStatus === "approved") &&
          s.contentItems &&
          s.contentItems.length > 0
        )
      })

      return {
        success: true,
        data: validationItems,
      }
    }
  }

  async getValidation(id: string): Promise<ApiResponse<any>> {
    try {
      return await this.request<any>(`${ENDPOINTS.VALIDATIONS}/${id}`)
    } catch (error) {
      console.warn(`API getValidation failed for ID ${id}, using local storage`)
      // Fallback to local storage
      const submissions = loadSubmissionsFromStorage()
      const submission = submissions.find((s: any) => s.id.toString() === id)

      if (submission) {
        return {
          success: true,
          data: submission,
        }
      }

      throw new Error("Validation not found")
    }
  }

  async submitValidation(id: string, validationData: ValidationData): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Submitting validation for ID ${id} locally (Mock Mode):`, validationData)
      
      const submissions = loadSubmissionsFromStorage()
      const index = submissions.findIndex((s: any) => s.id.toString() === id)

      if (index !== -1) {
        const mappedStatus = validationData.status
          ? validationData.status
          : (validationData.validation_status === 'setuju' ? 'validated' : (validationData.validation_status === 'ditolak' ? 'rejected' : undefined))

        submissions[index] = {
          ...submissions[index],
          validationStatus: mappedStatus,
          validationNotes: validationData.notes,
          validatedBy: validationData.validatorId,
          validatedAt: new Date().toISOString(),
          publishDate: validationData.publishDate,
          publishedContent: validationData.publishedContent,
          workflowStage: mappedStatus === "published" || mappedStatus === "validated" ? "completed" : "validation",
          updatedAt: new Date().toISOString(),
        }
        saveSubmissionsToStorage(submissions)

        return {
          success: true,
          data: submissions[index],
          message: "Validation saved locally"
        }
      }

      throw new Error("Validation not found")
    } catch (error) {
      console.error(`❌ Failed to submit validation for ID ${id} locally:`, error)
      return {
        success: false,
        message: "Failed to save validation locally"
      }
    }
  }

  // User management methods
  async getUsers(filters?: any): Promise<ApiResponse<User[]>> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
      return await this.request<User[]>(`${ENDPOINTS.USERS}${queryParams}`)
    } catch (error) {
      console.warn("API getUsers failed, using mock users")
      // Mock users for development
      const mockUsers: User[] = [
        {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          name: "Administrator",
        },
        {
          id: "2",
          username: "reviewer",
          email: "reviewer@example.com",
          role: "reviewer",
          name: "Content Reviewer",
        },
        {
          id: "3",
          username: "validator",
          email: "validator@example.com",
          role: "validator",
          name: "Content Validator",
        },
      ]

      return {
        success: true,
        data: mockUsers,
      }
    }
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await this.request<User>(ENDPOINTS.USERS, {
        method: "POST",
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.warn("API createUser failed, using mock creation")
      // Mock user creation
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username || "",
        email: userData.email || "",
        role: userData.role || "user",
        name: userData.name || "",
      }

      return {
        success: true,
        data: newUser,
      }
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await this.request<User>(`${ENDPOINTS.USERS}/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.warn(`API updateUser failed for ID ${id}, using mock update`)
      // Mock user update
      const updatedUser: User = {
        id,
        username: userData.username || "",
        email: userData.email || "",
        role: userData.role || "user",
        name: userData.name || "",
      }

      return {
        success: true,
        data: updatedUser,
      }
    }
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      return await this.request(`${ENDPOINTS.USERS}/${id}`, { method: "DELETE" })
    } catch (error) {
      console.warn(`API deleteUser failed for ID ${id}, using mock deletion`)
      // Mock user deletion
      return { success: true }
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL)

// Export individual functions for convenience
export const login = (credentials: LoginCredentials) => apiClient.login(credentials)
export const logout = () => apiClient.logout()
export const getCurrentUser = () => apiClient.getCurrentUser()

export const getSubmissions = (filters?: any) => apiClient.getSubmissions(filters)
export const getSubmission = (id: string) => apiClient.getSubmission(id)
export const createSubmission = (data: any) => apiClient.createSubmission(data)
export const updateSubmission = (id: string, data: any) => apiClient.updateSubmission(id, data)
export const deleteSubmission = (id: string) => apiClient.deleteSubmission(id)

export const getReviews = (filters?: any) => apiClient.getReviews(filters)
export const getReview = (id: string) => apiClient.getReview(id)
export const submitReview = (id: string, reviewData: ReviewData) => apiClient.submitReview(id, reviewData)
export const assignReview = (id: string, assigneeId: string) => apiClient.assignReview(id, assigneeId)

export const getValidations = (filters?: any) => apiClient.getValidations(filters)
export const getValidation = (id: string) => apiClient.getValidation(id)
export const submitValidation = (id: string, validationData: ValidationData) =>
  apiClient.submitValidation(id, validationData)

export const getUsers = (filters?: any) => apiClient.getUsers(filters)
export const createUser = (userData: Partial<User>) => apiClient.createUser(userData)
export const updateUser = (id: string, userData: Partial<User>) => apiClient.updateUser(id, userData)
export const deleteUser = (id: string) => apiClient.deleteUser(id)

// Export the client instance as default
export default apiClient

// Export types
export type { ApiResponse, LoginCredentials, User, ReviewData, ValidationData }

// Export error class
export class ApiError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.details = details
  }
}
