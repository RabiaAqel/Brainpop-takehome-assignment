import { useUserStore } from '@/stores/user'
import router from '@/router'
import { API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from '@/utilities/constants'

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
  }

  handleAuthError() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    
    const userStore = useUserStore()
    userStore.handleAuthError()
    
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`
    }

    console.log('API Request:', {
      url,
      method: defaultOptions.method || 'GET',
      headers: defaultOptions.headers,
      body: defaultOptions.body
    })

    try {
      const response = await fetch(url, defaultOptions)
      const data = await response.json()

      console.log('API Response:', {
        status: response.status,
        url,
        data
      })

      if (!response.ok) {
        if (response.status === HTTP_STATUS.UNAUTHORIZED || response.status === HTTP_STATUS.FORBIDDEN) {
          this.handleAuthError()
          throw new Error('Authentication required. Please log in.')
        }
        
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('API Error:', {
        url,
        error: error.message
      })
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to the server')
      }
      
      if (error.message.includes('Authentication required')) {
        throw error
      }
      
      throw error
    }
  }

  // Auth API methods
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })
  }

  // Quiz API methods
  async getQuizzes() {
    return this.request('/quizzes')
  }

  async getQuizInfo(quizId) {
    return this.request(`/quizzes/${quizId}`)
  }

  async getQuizQuestions(quizId) {
    return this.request(`/quizzes/${quizId}/questions`)
  }

  async getQuizResults(quizId) {
    return this.request(`/quizzes/${quizId}/results`)
  }

  async startQuizAttempt(quizId) {
    return this.request('/quiz/attempt', {
      method: 'POST',
      body: JSON.stringify({ quiz_id: quizId })
    })
  }

  async saveAnswer(attemptId, questionId, optionId) {
    return this.request(`/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option_id: optionId
      })
    })
  }

  async submitAttempt(attemptId) {
    return this.request(`/attempts/${attemptId}/submit`, {
      method: 'POST'
    })
  }
}

export default new ApiService() 