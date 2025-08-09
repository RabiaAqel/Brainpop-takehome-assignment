import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useQuizStore } from '@/stores/quiz'
import QuizSummaryScreen from './QuizSummaryScreen.vue'

jest.mock('@/components/base/backgrounds/white/BackgroundWhite.vue', () => ({
  name: 'BackgroundWhite',
  template: '<div class="background-white"></div>'
}))

jest.mock('@/components/compositions/navigator/Navigator.vue', () => ({
  name: 'Navigator',
  template: '<div class="navigator"></div>'
}))

jest.mock('@/components/base/secondary-header/SecondaryHeader.vue', () => ({
  name: 'SecondaryHeader',
  template: '<div class="secondary-header"></div>'
}))

jest.mock('@/components/base/score-header/ScoreHeader.vue', () => ({
  name: 'ScoreHeader',
  template: '<div class="score-header"></div>',
  props: ['score', 'total']
}))

jest.mock('@/components/compositions/QuestionCard.vue', () => ({
  name: 'QuestionCard',
  template: '<div class="question-card"></div>',
  props: ['question', 'questionNumber', 'selectedOptionId', 'readonly']
}))

describe('QuizSummaryScreen', () => {
  let wrapper
  let quizStore
  let pinia

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

  const mockSelectedAnswers = {
    1: 2,
    2: 7 
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    quizStore = useQuizStore()
    
    quizStore.questions = mockQuestions
    quizStore.answers = mockSelectedAnswers
    
    wrapper = mount(QuizSummaryScreen, {
      global: {
        plugins: [pinia]
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders loading state when loading is true', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading').exists()).toBe(true)
      expect(wrapper.find('.loading').text()).toBe('Loading results...')
    })

    it('renders error state when error exists', async () => {
      wrapper.vm.error = 'Failed to load results'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.error').exists()).toBe(true)
      expect(wrapper.find('.error').text()).toBe('Failed to load results')
    })

    it('renders score header when data is loaded', async () => {
      wrapper.vm.loading = false
      wrapper.vm.error = null
      wrapper.vm.score = 1
      wrapper.vm.totalQuestions = 2
      await wrapper.vm.$nextTick()
      
      const scoreHeader = wrapper.findComponent({ name: 'ScoreHeader' })
      expect(scoreHeader.exists()).toBe(true)
      expect(scoreHeader.props('score')).toBe(1)
      expect(scoreHeader.props('total')).toBe(2)
    })

    it('renders question cards for each question', async () => {
      wrapper.vm.loading = false
      wrapper.vm.error = null
      wrapper.vm.questions = mockQuestions
      wrapper.vm.selectedAnswers = mockSelectedAnswers
      await wrapper.vm.$nextTick()
      
      const questionCards = wrapper.findAllComponents({ name: 'QuestionCard' })
      expect(questionCards).toHaveLength(2)
      
      questionCards.forEach(card => {
        expect(card.props('readonly')).toBe(true)
      })
    })

    it('displays correct breadcrumb items', () => {
      const navigator = wrapper.findComponent({ name: 'Navigator' })
      expect(navigator.props('items')).toEqual([
        { text: 'General Knowledge Quiz' },
        { text: 'Quiz' },
        { text: 'Summary' }
      ])
    })
  })

  describe('Data Loading', () => {
    it('loads quiz results on mount', async () => {
      const spy = jest.spyOn(wrapper.vm, 'loadQuizResults')
      
      await wrapper.vm.$nextTick()
      
      expect(spy).toHaveBeenCalled()
    })

    it('uses store data when available', async () => {
      wrapper.vm.questions = []
      wrapper.vm.selectedAnswers = {}
      
      await wrapper.vm.loadQuizResults()
      
      expect(wrapper.vm.questions).toEqual(mockQuestions)
      expect(wrapper.vm.selectedAnswers).toEqual(mockSelectedAnswers)
      expect(wrapper.vm.score).toBe(1) 
      expect(wrapper.vm.totalQuestions).toBe(2)
    })

    it('loads from API when store data is not available', async () => {
      quizStore.questions = []
      quizStore.answers = {}
      
      const mockResults = {
        correct_answers: 1,
        total_questions: 2,
        options: [
          { question_id: 1, option_id: 2 },
          { question_id: 2, option_id: 7 }
        ]
      }
      
      jest.spyOn(quizStore, 'loadQuizResults').mockResolvedValue(mockResults)
      jest.spyOn(quizStore, 'loadQuestions').mockResolvedValue()
      
      await wrapper.vm.loadQuizResults()
      
      expect(wrapper.vm.score).toBe(1)
      expect(wrapper.vm.totalQuestions).toBe(2)
      expect(quizStore.loadQuestions).toHaveBeenCalledWith(1)
    })

    it('handles loading errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Failed to load results')
      
      jest.spyOn(quizStore, 'loadQuizResults').mockRejectedValue(error)
      
      await wrapper.vm.loadQuizResults()
      
      expect(wrapper.vm.error).toBe('Failed to load results')
      expect(consoleSpy).toHaveBeenCalledWith('Error loading quiz results:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('Score Display', () => {
    it('displays score from server results', async () => {
      const mockResults = {
        total_questions: 5,
        correct_answers: 3,
        options: [
          { question_id: 1, option_id: 2 },
          { question_id: 2, option_id: 6 }
        ]
      }
      
      // Mock the store to have results
      wrapper.vm.quizStore.hasResults = true
      wrapper.vm.quizStore.getScore = jest.fn().mockReturnValue({
        total: 5,
        correct: 3,
        percentage: 60
      })
      wrapper.vm.quizStore.questions = mockQuestions
      wrapper.vm.quizStore.answers = mockSelectedAnswers
      
      await wrapper.vm.loadQuizResults()
      
      expect(wrapper.vm.score).toBe(3)
      expect(wrapper.vm.totalQuestions).toBe(5)
    })

    it('loads score from API when no store results', async () => {
      const mockResults = {
        total_questions: 5,
        correct_answers: 2,
        options: [
          { question_id: 1, option_id: 1 },
          { question_id: 2, option_id: 5 }
        ]
      }
      
      wrapper.vm.quizStore.hasResults = false
      wrapper.vm.quizStore.loadQuizResults = jest.fn().mockResolvedValue(mockResults)
      wrapper.vm.quizStore.loadQuestions = jest.fn().mockResolvedValue()
      
      await wrapper.vm.loadQuizResults()
      
      expect(wrapper.vm.score).toBe(2)
      expect(wrapper.vm.totalQuestions).toBe(5)
    })
  })

  describe('Data Properties', () => {
    it('initializes with correct default values', () => {
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.error).toBe(null)
      expect(wrapper.vm.questions).toEqual([])
      expect(wrapper.vm.selectedAnswers).toEqual({})
      expect(wrapper.vm.score).toBe(0)
      expect(wrapper.vm.totalQuestions).toBe(0)
    })

    it('has correct breadcrumb items', () => {
      expect(wrapper.vm.breadcrumbItems).toEqual([
        { text: 'General Knowledge Quiz' },
        { text: 'Quiz' },
        { text: 'Summary' }
      ])
    })
  })

  describe('Computed Properties', () => {
    it('returns quiz store instance', () => {
      expect(wrapper.vm.quizStore).toBe(quizStore)
    })
  })

  describe('Question Display', () => {
    it('passes correct props to question cards', async () => {
      wrapper.vm.loading = false
      wrapper.vm.error = null
      wrapper.vm.questions = mockQuestions
      wrapper.vm.selectedAnswers = mockSelectedAnswers
      await wrapper.vm.$nextTick()
      
      const questionCards = wrapper.findAllComponents({ name: 'QuestionCard' })
      
      expect(questionCards[0].props('question')).toBe(mockQuestions[0])
      expect(questionCards[0].props('questionNumber')).toBe(1)
      expect(questionCards[0].props('selectedOptionId')).toBe(2)
      expect(questionCards[0].props('readonly')).toBe(true)
      
      expect(questionCards[1].props('question')).toBe(mockQuestions[1])
      expect(questionCards[1].props('questionNumber')).toBe(2)
      expect(questionCards[1].props('selectedOptionId')).toBe(7)
      expect(questionCards[1].props('readonly')).toBe(true)
    })
  })
}) 