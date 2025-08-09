import { defineStore } from 'pinia'
import authService from '@/services/auth.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    getToken: (state) => state.token || authService.getToken()
  },

  actions: {
    // Login with async/await pattern (no callbacks)
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const result = await authService.login(credentials)
        
        if (result.success) {
          this.setAuthState(result.token, result.user)
          return { success: true }
        } else {
          this.clearAuthState()
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.clearAuthState()
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    logout() {
      authService.logout()
      this.clearAuthState()
    },

    handleAuthError() {
      this.clearAuthState()
      this.error = 'Authentication required. Please log in.'
      localStorage.removeItem('auth_token')
    },

    initAuth() {
      const authState = authService.initAuth()
      if (authState.isAuthenticated) {
        this.token = authState.token
      }
    },

    setAuthState(token, user) {
      this.token = token
      this.user = user
      this.error = null
    },

    clearAuthState() {
      this.token = null
      this.user = null
      this.error = null
    },

    clearError() {
      this.error = null
    }
  }
})
