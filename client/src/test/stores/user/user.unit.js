import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import authService from '@/services/auth.js'

jest.mock('@/services/auth.js', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    logout: jest.fn(),
    getToken: jest.fn(),
    initAuth: jest.fn()
  }
}))

describe('User Store', () => {
  let store
  let pinia

  const mockCredentials = {
    email: 'test@example.com',
    password: 'password123'
  }

  const mockAuthResult = {
    success: true,
    token: 'mock-token-123',
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    }
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useUserStore()
    
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('returns false for isLoggedIn when no token', () => {
      store.token = null
      expect(store.isLoggedIn).toBe(false)
    })

    it('returns true for isLoggedIn when token exists', () => {
      store.token = 'mock-token'
      expect(store.isLoggedIn).toBe(true)
    })

    it('returns token from state', () => {
      store.token = 'state-token'
      expect(store.getToken).toBe('state-token')
    })

    it('falls back to authService.getToken when no state token', () => {
      store.token = null
      authService.getToken.mockReturnValue('service-token')
      
      expect(store.getToken).toBe('service-token')
      expect(authService.getToken).toHaveBeenCalled()
    })
  })

  describe('Actions', () => {
    describe('login', () => {
      it('logs in successfully', async () => {
        authService.login.mockResolvedValue(mockAuthResult)
        
        const result = await store.login(mockCredentials)
        
        expect(authService.login).toHaveBeenCalledWith(mockCredentials)
        expect(store.token).toBe('mock-token-123')
        expect(store.user).toEqual(mockAuthResult.user)
        expect(store.error).toBeNull()
        expect(store.loading).toBe(false)
        expect(result).toEqual({ success: true })
      })

      it('handles login failure', async () => {
        const failedResult = {
          success: false,
          error: 'Invalid credentials'
        }
        authService.login.mockResolvedValue(failedResult)
        
        const result = await store.login(mockCredentials)
        
        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.error).toBe('Invalid credentials')
        expect(store.loading).toBe(false)
        expect(result).toEqual({ success: false, error: 'Invalid credentials' })
      })

      it('handles login error', async () => {
        const error = new Error('Network error')
        authService.login.mockRejectedValue(error)
        
        const result = await store.login(mockCredentials)
        
        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.error).toBe('Network error')
        expect(store.loading).toBe(false)
        expect(result).toEqual({ success: false, error: 'Network error' })
      })

      it('sets loading state during login', async () => {
        authService.login.mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve(mockAuthResult), 100))
        )
        
        const loginPromise = store.login(mockCredentials)
        
        expect(store.loading).toBe(true)
        
        await loginPromise
        
        expect(store.loading).toBe(false)
      })

      it('clears error on successful login', async () => {
        store.error = 'Previous error'
        authService.login.mockResolvedValue(mockAuthResult)
        
        await store.login(mockCredentials)
        
        expect(store.error).toBeNull()
      })
    })

    describe('logout', () => {
      beforeEach(() => {
        store.token = 'mock-token'
        store.user = { id: 1, name: 'Test User' }
        store.error = 'Some error'
      })

      it('logs out successfully', () => {
        store.logout()
        
        expect(authService.logout).toHaveBeenCalled()
        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.error).toBeNull()
      })
    })

    describe('handleAuthError', () => {
      beforeEach(() => {
        store.token = 'mock-token'
        store.user = { id: 1, name: 'Test User' }
        store.error = null
      })

      it('handles auth error correctly', () => {
        const localStorageSpy = jest.spyOn(Storage.prototype, 'removeItem')
        
        store.handleAuthError()
        
        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.error).toBe('Authentication required. Please log in.')
        expect(localStorageSpy).toHaveBeenCalledWith('auth_token')
        
        localStorageSpy.mockRestore()
      })
    })

    describe('initAuth', () => {
      it('initializes auth state from service', () => {
        const mockAuthState = {
          isAuthenticated: true,
          token: 'persisted-token'
        }
        authService.initAuth.mockReturnValue(mockAuthState)
        
        store.initAuth()
        
        expect(authService.initAuth).toHaveBeenCalled()
        expect(store.token).toBe('persisted-token')
      })

      it('does not set token when not authenticated', () => {
        const mockAuthState = {
          isAuthenticated: false,
          token: null
        }
        authService.initAuth.mockReturnValue(mockAuthState)
        
        store.initAuth()
        
        expect(store.token).toBeNull()
      })
    })

    describe('setAuthState', () => {
      it('sets auth state correctly', () => {
        const token = 'new-token'
        const user = { id: 2, name: 'New User' }
        
        store.setAuthState(token, user)
        
        expect(store.token).toBe(token)
        expect(store.user).toStrictEqual(user)
        expect(store.error).toBeNull()
      })
    })

    describe('clearAuthState', () => {
      beforeEach(() => {
        store.token = 'mock-token'
        store.user = { id: 1, name: 'Test User' }
        store.error = 'Some error'
      })

      it('clears auth state correctly', () => {
        store.clearAuthState()
        
        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.error).toBeNull()
      })
    })

    describe('clearError', () => {
      it('clears error state', () => {
        store.error = 'Some error'
        
        store.clearError()
        
        expect(store.error).toBeNull()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors during login', async () => {
      const networkError = new Error('Network timeout')
      authService.login.mockRejectedValue(networkError)
      
      const result = await store.login(mockCredentials)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Network timeout')
      expect(store.error).toBe('Network timeout')
    })

    it('handles service errors during login', async () => {
      const serviceError = new Error('Service unavailable')
      authService.login.mockRejectedValue(serviceError)
      
      const result = await store.login(mockCredentials)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Service unavailable')
    })
  })

  describe('State Management', () => {
    it('maintains loading state correctly', async () => {
      // Start with loading false
      expect(store.loading).toBe(false)
      
      // Simulate login process
      authService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockAuthResult), 50))
      )
      
      const loginPromise = store.login(mockCredentials)
      
      // Should be loading during the process
      expect(store.loading).toBe(true)
      
      await loginPromise
      
      // Should be false after completion
      expect(store.loading).toBe(false)
    })

    it('handles multiple rapid login attempts', async () => {
      authService.login.mockResolvedValue(mockAuthResult)
      
      const promises = [
        store.login(mockCredentials),
        store.login(mockCredentials),
        store.login(mockCredentials)
      ]
      
      await Promise.all(promises)
      
      expect(store.loading).toBe(false)
      expect(store.token).toBe('mock-token-123')
    })
  })

  describe('Token Management', () => {
    it('retrieves token from service when not in state', () => {
      store.token = null
      authService.getToken.mockReturnValue('service-token')
      
      const token = store.getToken
      
      expect(token).toBe('service-token')
      expect(authService.getToken).toHaveBeenCalled()
    })

    it('prefers state token over service token', () => {
      store.token = 'state-token'
      authService.getToken.mockReturnValue('service-token')
      
      const token = store.getToken
      
      expect(token).toBe('state-token')
    })
  })
}) 