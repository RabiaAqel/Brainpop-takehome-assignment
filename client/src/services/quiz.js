import apiService from './api.js'

class QuizService {
  async getQuizzes() {
    const response = await apiService.getQuizzes()
    return response.data || response
  }

  async getQuizInfo(quizId) {
    const response = await apiService.getQuizInfo(quizId)
    return response.data || response
  }

  async getQuizQuestions(quizId) {
    const response = await apiService.getQuizQuestions(quizId)
    return response.data || response
  }

  async getQuizResults(quizId) {
    const response = await apiService.getQuizResults(quizId)
    return response.data || response
  }

  async startQuizAttempt(quizId) {
    const response = await apiService.startQuizAttempt(quizId)
    return response.data || response
  }

  async saveAnswer(attemptId, answers) {
    const answerArray = Array.isArray(answers) ? answers : [answers]
    
    const results = []
    for (const answer of answerArray) {
      const result = await apiService.saveAnswer(
        attemptId, 
        answer.questionId, 
        answer.optionId
      )
      results.push(result)
    }
    
    return results
  }

  async submitAttempt(attemptId) {
    const response = await apiService.submitAttempt(attemptId)
    return response.data || response
  }
}

export default new QuizService() 