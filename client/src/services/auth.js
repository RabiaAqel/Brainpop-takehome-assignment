import apiService from './api.js'

class AuthService {
  async login(credentials) {
    try {
      const response = await apiService.login(credentials)
      
      // store in local storage
      localStorage.setItem('auth_token', response.access_token)
      localStorage.setItem('loggedIn', 'true')
      
      return {
        success: true,
        token: response.access_token,
        user: response.user || null
      }
    } catch (error) {
      // clear
      localStorage.removeItem('auth_token')
      localStorage.removeItem('loggedIn')
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('loggedIn')
  }

  getToken() {
    return localStorage.getItem('auth_token')
  }

  isAuthenticated() {
    return !!this.getToken()
  }

  initAuth() {
    const token = this.getToken()
    const loggedIn = localStorage.getItem('loggedIn')
    
    return {
      isAuthenticated: !!(token && loggedIn),
      token: token || null
    }
  }
}

export default new AuthService() 