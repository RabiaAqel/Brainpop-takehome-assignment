import { defineStore } from 'pinia'
import { quizService } from '@/services'

const QUIZ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

const debounce = (func, delay) => {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    // quiz data
    quiz: {
      id: null,
      name: '',
      totalQuestions: 0,
      description: ''
    },
    // available quizzes list
    availableQuizzes: [],
    attempt: {
      id: null,
      status: QUIZ_STATUS.NOT_STARTED,
      startTime: null,
      endTime: null
    },
    questions: [],
    answers: {},
    
    // quiz results (server-calculated)
    results: {
      totalQuestions: 0,
      correctAnswers: 0,
      percentage: 0,
      answers: []
    },
    
    // save state
    saveState: {
      pending: [],
      isSaving: false,
      lastSaved: null,
      errors: []
    },
    
    // UI state
    ui: {
      loading: false,
      error: null,
      currentIndex: 0,
      screen: 'start'
    }
  }),

  getters: {
    // quiz
    quizInfo: (state) => state.quiz,
    quizName: (state) => state.quiz.name,
    totalQuestions: (state) => state.quiz.totalQuestions,
    availableQuizzes: (state) => state.availableQuizzes,
    
    // quiz attempt
    isInProgress: (state) => state.attempt.status === QUIZ_STATUS.IN_PROGRESS,
    
    // quiz questions
    currentQuestion: (state) => state.questions[state.ui.currentIndex] || null,
    isLastQuestion: (state) => state.ui.currentIndex === state.questions.length - 1,
    isFirstQuestion: (state) => state.ui.currentIndex === 0,
    
    // progress
    progress: (state) => {
      const total = state.questions.length
      const answered = Object.keys(state.answers).length
      const percentage = total > 0 ? Math.round((answered / total) * 100) : 0
      return {
        answered,
        total,
        percentage
      }
    },
    
    // Save state
    hasPendingSaves: (state) => state.saveState.pending.length > 0,
    isSaving: (state) => state.saveState.isSaving,
    
    // UI state
    isLoading: (state) => state.ui.loading,
    hasError: (state) => !!state.ui.error,
    currentIndex: (state) => state.ui.currentIndex,
    currentScreen: (state) => state.ui.screen,
    
    // Results (server-calculated)
    quizResults: (state) => state.results,
    hasResults: (state) => state.results.totalQuestions > 0
  },

  actions: {
    async loadAvailableQuizzes() {
      await this.withLoading(async () => {
        const quizzes = await quizService.getQuizzes()
        this.availableQuizzes = quizzes.map(quiz => ({
          id: quiz.id,
          name: quiz.title,
          totalQuestions: quiz.total_questions,
          description: quiz.description
        }))
      })
    },

    async loadQuiz(quizId) {
      await this.withLoading(async () => {
        const data = await quizService.getQuizInfo(quizId)
        this.quiz = {
          id: data.id,
          name: data.title,
          totalQuestions: data.total_questions,
          description: data.description
        }
      })
    },

    async startQuiz(quizId) {
      await this.withLoading(async () => {
        // load if not laoded
        if (!this.quiz.id) {
          await this.loadQuiz(quizId)
        }
        
        // quiz attemot
        const attemptData = await quizService.startQuizAttempt(quizId)
        this.attempt = {
          id: attemptData.attempt_id,
          status: QUIZ_STATUS.IN_PROGRESS,
          startTime: new Date(),
          endTime: null
        }
        
        // Load questions
        await this.loadQuestions(quizId)
      })
    },

    async startNewQuiz(quizId) {
      this.reset()
      await this.startQuiz(quizId)
      this.ui.screen = 'questions'
    },

    async loadQuestions(quizId) {
      const questions = await quizService.getQuizQuestions(quizId)
      this.questions = questions.data || questions
      this.ui.currentIndex = 0
    },

    async loadQuizResults(quizId) {
      try {
        const results = await quizService.getQuizResults(quizId)
        return results
      } catch (error) {
        this.ui.error = error.message
        throw error
      }
    },

    selectAnswer(questionId, optionId) {
      this.answers[questionId] = optionId
      this.queueSave(questionId, optionId)
    },

    queueSave(questionId, optionId) {
      // override existing answer
      this.saveState.pending = this.saveState.pending.filter(
        save => save.questionId !== questionId
      )
      // queue new answer
      this.saveState.pending.push({ questionId, optionId })
      this.debouncedSave()
    },

    debouncedSave: debounce(function() {
      this.saveAnswers()
    }, 500),

    async saveAnswers() {
      if (this.saveState.isSaving || this.saveState.pending.length === 0) {
        return
      }
      
      this.saveState.isSaving = true
      const pending = [...this.saveState.pending]
      this.saveState.pending = []
      
      try {
        await quizService.saveAnswer(this.attempt.id, pending)
        this.saveState.lastSaved = Date.now()
        this.saveState.errors = []
      } catch (error) {
        this.saveState.pending.unshift(...pending)
        this.saveState.errors.push(error.message)
        throw error
      } finally {
        this.saveState.isSaving = false
      }
    },

    nextQuestion() {
      if (this.ui.currentIndex < this.questions.length - 1) {
        this.ui.currentIndex++
      }
    },
    previousQuestion() {
      if (this.ui.currentIndex > 0) {
        this.ui.currentIndex--
      }
    },

    
    async submitQuiz() {
      if (!this.isInProgress) {
        throw new Error('Quiz is not in progress')
      }
      
      return await this.withLoading(async () => {
        if (this.hasPendingSaves) {
          await this.saveAnswers()
        }
        
        const result = await quizService.submitAttempt(this.attempt.id)
        this.attempt.status = QUIZ_STATUS.COMPLETED
        this.attempt.endTime = new Date()
        
        // Store server-calculated results
        this.results = {
          totalQuestions: result.total_questions,
          correctAnswers: result.correct_answers,
          percentage: result.percentage || 0,
          answers: result.answers || []
        }
        
        return result
      })
    },

    goToSummary() {
      this.attempt.status = QUIZ_STATUS.COMPLETED
      this.ui.screen = 'summary'
    },

    getSelectedAnswer(questionId) {
      return this.answers[questionId] || null
    },

    isQuestionAnswered(questionId) {
      return questionId in this.answers
    },

    getScore() {
      // Return server-calculated score (only available after submission)
      return {
        total: this.results.totalQuestions,
        correct: this.results.correctAnswers,
        percentage: this.results.percentage
      }
    },

    reset() {
      this.attempt = {
        id: null,
        status: QUIZ_STATUS.NOT_STARTED,
        startTime: null,
        endTime: null
      }
      this.questions = []
      this.answers = {}
      this.results = {
        totalQuestions: 0,
        correctAnswers: 0,
        percentage: 0,
        answers: []
      }
      this.saveState = {
        pending: [],
        isSaving: false,
        lastSaved: null,
        errors: []
      }
      this.ui = {
        loading: false,
        error: null,
        currentIndex: 0,
        screen: 'start'
      }
    },

    clearError() {
      this.ui.error = null
    },

    async withLoading(action) {
      this.ui.loading = true
      this.ui.error = null
      try {
        return await action()
      } catch (error) {
        this.ui.error = error.message
        throw error
      } finally {
        this.ui.loading = false
      }
    }
  }
}) 