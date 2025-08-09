import { setActivePinia, createPinia } from 'pinia'
import { useQuizStore } from '@/stores/quiz'
import { quizService } from '@/services'

jest.mock('@/services', () => ({
  quizService: {
    getQuizInfo: jest.fn(),
    startQuizAttempt: jest.fn(),
    getQuizQuestions: jest.fn(),
    getQuizResults: jest.fn(),
    saveAnswer: jest.fn(),
    submitAttempt: jest.fn()
  }
}))

describe('Quiz Store', () => {
  let store
  let pinia

  const mockQuizInfo = {
    id: 1,
    title: 'General Knowledge Quiz',
    total_questions: 5,
    description: 'Test your general knowledge'
  }

  const mockQuestions = [
    {
      id: 1,
      text: 'What is the capital of France?',
      options: [
        { id: 1, text: 'London', is_correct: false },
        { id: 2, text: 'Paris', is_correct: true },
        { id: 3, text: 'Berlin', is_correct: false },
        { id: 4, text: 'Madrid', is_correct: false }
      ]
    },
    {
      id: 2,
      text: 'What is 2 + 2?',
      options: [
        { id: 5, text: '3', is_correct: false },
        { id: 6, text: '4', is_correct: true },
        { id: 7, text: '5', is_correct: false },
        { id: 8, text: '6', is_correct: false }
      ]
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useQuizStore()
    
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      expect(store.quiz).toEqual({
        id: null,
        name: '',
        totalQuestions: 0,
        description: ''
      })
      
      expect(store.attempt).toEqual({
        id: null,
        status: 'not_started',
        startTime: null,
        endTime: null
      })
      
      expect(store.questions).toEqual([])
      expect(store.answers).toEqual({})
      expect(store.ui).toEqual({
        loading: false,
        error: null,
        currentIndex: 0,
        screen: 'start'
      })
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      store.quiz = {
        id: mockQuizInfo.id,
        name: mockQuizInfo.title,
        totalQuestions: mockQuizInfo.total_questions,
        description: mockQuizInfo.description
      }
      store.questions = mockQuestions
      store.answers = { 1: 2, 2: 6 }
    })

    it('returns quiz info', () => {
      expect(store.quizInfo).toEqual({
        id: mockQuizInfo.id,
        name: mockQuizInfo.title,
        totalQuestions: mockQuizInfo.total_questions,
        description: mockQuizInfo.description
      })
    })

    it('returns quiz name', () => {
      expect(store.quizName).toBe('General Knowledge Quiz')
    })

    it('returns total questions', () => {
      expect(store.totalQuestions).toBe(5)
    })

    it('returns current question', () => {
      expect(store.currentQuestion).toEqual(mockQuestions[0])
    })

    it('returns null for current question when no questions', () => {
      store.questions = []
      expect(store.currentQuestion).toBeNull()
    })

    it('identifies last question correctly', () => {
      store.ui.currentIndex = 1
      expect(store.isLastQuestion).toBe(true)
      
      store.ui.currentIndex = 0
      expect(store.isLastQuestion).toBe(false)
    })

    it('identifies first question correctly', () => {
      store.ui.currentIndex = 0
      expect(store.isFirstQuestion).toBe(true)
      
      store.ui.currentIndex = 1
      expect(store.isFirstQuestion).toBe(false)
    })

    it('calculates progress correctly', () => {
      expect(store.progress).toEqual({
        answered: 2,
        total: 2,
        percentage: 100
      })
    })

    it('calculates progress with no answers', () => {
      store.answers = {}
      expect(store.progress).toEqual({
        answered: 0,
        total: 2,
        percentage: 0
      })
    })

    it('returns selected answer for question', () => {
      expect(store.getSelectedAnswer(1)).toBe(2)
      expect(store.getSelectedAnswer(2)).toBe(6)
      expect(store.getSelectedAnswer(3)).toBeNull()
    })

    it('checks if question is answered', () => {
      expect(store.isQuestionAnswered(1)).toBe(true)
      expect(store.isQuestionAnswered(2)).toBe(true)
      expect(store.isQuestionAnswered(3)).toBe(false)
    })

    //
    it('returns server-calculated score when available', () => {
      // Set up server results
      store.results = {
        totalQuestions: 5,
        correctAnswers: 3,
        percentage: 60,
        answers: []
      }
      
      const score = store.getScore()
      expect(score.total).toBe(5)
      expect(score.correct).toBe(3)
      expect(score.percentage).toBe(60)
    })

    it('returns empty score when no results available', () => {
      store.results = {
        totalQuestions: 0,
        correctAnswers: 0,
        percentage: 0,
        answers: []
      }
      
      const score = store.getScore()
      expect(score.total).toBe(0)
      expect(score.correct).toBe(0)
      expect(score.percentage).toBe(0)
    })
  })

  describe('Actions', () => {
    describe('loadQuiz', () => {
      it('loads quiz info successfully', async () => {
        quizService.getQuizInfo.mockResolvedValue(mockQuizInfo)
        
        await store.loadQuiz(1)
        
        expect(quizService.getQuizInfo).toHaveBeenCalledWith(1)
        expect(store.quiz).toEqual({
          id: 1,
          name: 'General Knowledge Quiz',
          totalQuestions: 5,
          description: 'Test your general knowledge'
        })
      })

      it('handles loading error', async () => {
        const error = new Error('Failed to load quiz')
        quizService.getQuizInfo.mockRejectedValue(error)
        
        await expect(store.loadQuiz(1)).rejects.toThrow('Failed to load quiz')
        expect(store.ui.error).toBe('Failed to load quiz')
      })
    })

    describe('startQuiz', () => {
      beforeEach(() => {
        quizService.startQuizAttempt.mockResolvedValue({ attempt_id: 123 })
        quizService.getQuizQuestions.mockResolvedValue({ data: mockQuestions })
      })


      it('starts quiz successfully', async () => {
        quizService.getQuizInfo.mockResolvedValue(mockQuizInfo)
        
        await store.startQuiz(1)
        
        expect(quizService.getQuizInfo).toHaveBeenCalledWith(1)
        expect(quizService.startQuizAttempt).toHaveBeenCalledWith(1)
        expect(quizService.getQuizQuestions).toHaveBeenCalledWith(1)
        expect(store.attempt.status).toBe('in_progress')
        expect(store.attempt.id).toBe(123)
        expect(store.questions).toEqual(mockQuestions)
        expect(store.ui.currentIndex).toBe(0)
      })

      it('loads quiz info if not already loaded', async () => {
        store.quiz.id = null
        quizService.getQuizInfo.mockResolvedValue(mockQuizInfo)
        
        await store.startQuiz(1)
        
        expect(quizService.getQuizInfo).toHaveBeenCalledWith(1)
      })
    })

    describe('startNewQuiz', () => {
      it('resets store and starts new quiz', async () => {
        store.questions = mockQuestions
        store.answers = { 1: 2 }
        store.ui.currentIndex = 1
        


        quizService.startQuizAttempt.mockResolvedValue({ attempt_id: 123 })
        quizService.getQuizQuestions.mockResolvedValue({ data: mockQuestions })
        
        await store.startNewQuiz(1)
        
        expect(store.questions).toEqual(mockQuestions)
        expect(store.answers).toEqual({})
        expect(store.ui.currentIndex).toBe(0) 
        expect(store.ui.screen).toBe('questions') 
      })
    })

    describe('selectAnswer', () => {
      it('selects answer and queues save', () => {
        const spy = jest.spyOn(store, 'queueSave')
        
        store.selectAnswer(1, 2)
        
        expect(store.answers[1]).toBe(2)
        expect(spy).toHaveBeenCalledWith(1, 2)
      })
    })

    describe('saveAnswers', () => {
      beforeEach(() => {
        store.attempt.id = 123
        store.saveState.pending = [
          { questionId: 1, optionId: 2 },
          { questionId: 2, optionId: 6 }
        ]
      })

      it('saves answers successfully', async () => {
        quizService.saveAnswer.mockResolvedValue()
        
        await store.saveAnswers()
        
        expect(quizService.saveAnswer).toHaveBeenCalledWith(123, [
          { questionId: 1, optionId: 2 },
          { questionId: 2, optionId: 6 }
        ])
        expect(store.saveState.pending).toEqual([])
        expect(store.saveState.lastSaved).toBeDefined()
      })

      it('handles save error', async () => {
        const error = new Error('Save failed')
        quizService.saveAnswer.mockRejectedValue(error)
        
        const pending = [...store.saveState.pending]
        
        await expect(store.saveAnswers()).rejects.toThrow('Save failed')
        
        expect(store.saveState.pending).toEqual(pending)
        expect(store.saveState.errors).toContain('Save failed')
      })

      it('does nothing when no pending saves', async () => {
        store.saveState.pending = []
        
        await store.saveAnswers()
        
        expect(quizService.saveAnswer).not.toHaveBeenCalled()
      })
    })


    describe('Navigation', () => {
      beforeEach(() => {
        store.questions = mockQuestions
      })

      it('moves to next question', () => {
        store.ui.currentIndex = 0
        
        store.nextQuestion()
        
        expect(store.ui.currentIndex).toBe(1)
      })


      it('does not move past last question', () => {
        store.ui.currentIndex = 1
        
        store.nextQuestion()
        
        expect(store.ui.currentIndex).toBe(1)
      })

      it('moves to previous question', () => {
        store.ui.currentIndex = 1
        
        store.previousQuestion()
        
        expect(store.ui.currentIndex).toBe(0)
      })

      it('does not move before first question', () => {
        store.ui.currentIndex = 0
        
        store.previousQuestion()
        
        expect(store.ui.currentIndex).toBe(0)
      })
    })

    describe('submitQuiz', () => {
      beforeEach(() => {
        store.attempt.id = 123
        store.attempt.status = 'in_progress'
        store.saveState.pending = []
      })

      it('submits quiz successfully', async () => {
        const mockResult = { score: 2, total: 2 }
        quizService.submitAttempt.mockResolvedValue(mockResult)
        
        const result = await store.submitQuiz()
        
        expect(quizService.submitAttempt).toHaveBeenCalledWith(123)
        expect(store.attempt.status).toBe('completed')
        expect(store.attempt.endTime).toBeDefined()
        expect(result).toEqual(mockResult)
      })

      it('saves pending answers before submitting', async () => {
        store.saveState.pending = [{ questionId: 1, optionId: 2 }]
        quizService.saveAnswer.mockResolvedValue()
        quizService.submitAttempt.mockResolvedValue({})
        
        await store.submitQuiz()
        
        expect(quizService.saveAnswer).toHaveBeenCalledWith(123, [
          { questionId: 1, optionId: 2 }
        ])
        expect(quizService.submitAttempt).toHaveBeenCalledWith(123)
      })

      it('throws error if quiz is not in progress', async () => {
        store.attempt.status = 'not_started'
        
        await expect(store.submitQuiz()).rejects.toThrow('Quiz is not in progress')
      })
    })

    describe('reset', () => {
      it('resets store to initial state', () => {
        store.questions = mockQuestions
        store.answers = { 1: 2 }
        store.ui.currentIndex = 1
        store.ui.screen = 'questions'
        store.attempt.id = 123
        store.attempt.status = 'in_progress'
        
        store.reset()
        
        expect(store.questions).toEqual([])
        expect(store.answers).toEqual({})
        expect(store.ui.currentIndex).toBe(0)
        expect(store.ui.screen).toBe('start')
        expect(store.attempt.id).toBeNull()
        expect(store.attempt.status).toBe('not_started')
      })
    })

    describe('withLoading', () => {
      it('handles loading state correctly', async () => {
        const action = jest.fn().mockResolvedValue('result')
        
        const result = await store.withLoading(action)
        
        expect(store.ui.loading).toBe(false)
        expect(store.ui.error).toBeNull()
        expect(result).toBe('result')
      })

      it('handles errors in loading action', async () => {
        const error = new Error('Action failed')
        const action = jest.fn().mockRejectedValue(error)
        
        await expect(store.withLoading(action)).rejects.toThrow('Action failed')
        
        expect(store.ui.loading).toBe(false)
        expect(store.ui.error).toBe('Action failed')
      })
    })
  })
}) 