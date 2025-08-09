import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useQuizStore } from '@/stores/quiz'
import { useUserStore } from '@/stores/user'
import QuizQuestionsScreen from './QuizQuestionsScreen.vue'

const mockRouter = {
  push: jest.fn()
}

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

jest.mock('@/components/compositions/quiz-navigation/QuizNavigation.vue', () => ({
  name: 'QuizNavigation',
  template: '<div class="quiz-navigation"></div>'
}))

jest.mock('@/components/compositions/QuestionCard.vue', () => ({
  name: 'QuestionCard',
  template: '<div class="question-card"></div>',
  props: ['question', 'questionNumber', 'selectedOptionId'],
  emits: ['option-selected']
}))

describe('QuizQuestionsScreen', () => {
  let wrapper
  let quizStore
  let userStore
  let pinia

  const mockQuestion = {
    id: 1,
    text: 'What is the capital of France?',
    options: [
      { id: 1, text: 'London', is_correct: false },
      { id: 2, text: 'Paris', is_correct: true },
      { id: 3, text: 'Berlin', is_correct: false },
      { id: 4, text: 'Madrid', is_correct: false }
    ]
  }

  const mockQuizInfo = {
    id: 1,
    name: 'General Knowledge Quiz',
    totalQuestions: 5,
    description: 'Test your general knowledge'
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    quizStore = useQuizStore()
    userStore = useUserStore()
    
    quizStore.quiz = mockQuizInfo
    quizStore.questions = [mockQuestion]
    quizStore.ui = {
      loading: false,
      error: null,
      currentIndex: 0,
      screen: 'questions'
    }
    quizStore.answers = {}
    
    wrapper = mount(QuizQuestionsScreen, {
      global: {
        plugins: [pinia],
        mocks: {
          $router: mockRouter
        }
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('renders correctly', () => {
    it('renders loading state when quiz is loading', async () => {
      quizStore.ui.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading').exists()).toBe(true)
      expect(wrapper.find('.loading').text()).toBe('Loading questions...')
    })

    it('renders error state when quiz has error', async () => {
      quizStore.ui.error = 'Failed to load questions'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.error').exists()).toBe(true)
      expect(wrapper.find('.error').text()).toBe('Failed to load questions')
    })

    it('renders question card when quiz is loaded', async () => {
      quizStore.ui.loading = false
      quizStore.ui.error = null
      await wrapper.vm.$nextTick()
      
      expect(wrapper.findComponent({ name: 'QuestionCard' }).exists()).toBe(true)
    })

    it('correctly renders breadcrumb items', () => {
      const navigator = wrapper.findComponent({ name: 'Navigator' })
      expect(navigator.props('items')).toEqual([
        { text: 'General Knowledge Quiz', to: '' },
        { text: 'Quiz', to: '' }
      ])
    })
  })

  describe('Navigation', () => {
    it('calls nextQuestion when not on last question', async () => {
      const spy = jest.spyOn(quizStore, 'nextQuestion')
      
      await wrapper.vm.handleNext()
      
      expect(spy).toHaveBeenCalled()
    })

    it('submits quiz when on last question', async () => {
      quizStore.ui.currentIndex = 0
      quizStore.questions = [mockQuestion] 
      
      const spy = jest.spyOn(wrapper.vm, 'submitQuiz')
      
      await wrapper.vm.handleNext()
      
      expect(spy).toHaveBeenCalled()
    })

    it('calls previousQuestion when back button is clicked', async () => {
      const spy = jest.spyOn(quizStore, 'previousQuestion')
      
      await wrapper.vm.handlePrevious()
      
      expect(spy).toHaveBeenCalled()
    })

    it('navigates to results page when quiz is submitted', async () => {
      await wrapper.vm.submitQuiz()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/feature/quiz/results')
    })
  })

  describe('Option Selection', () => {
    it('selects answer when option is selected', async () => {
      const spy = jest.spyOn(quizStore, 'selectAnswer')
      const option = { id: 2, text: 'Paris' }
      
      await wrapper.vm.handleOptionSelected(option)
      
      expect(spy).toHaveBeenCalledWith(mockQuestion.id, option.id)
    })
  })

  describe('Computed Properties', () => {
    it('returns correct current question index', () => {
      expect(wrapper.vm.currentQuestionIndex).toBe(0)
    })

    it('returns correct breadcrumb items', () => {
      const items = wrapper.vm.breadcrumbItems
      expect(items).toEqual([
        { text: 'General Knowledge Quiz', to: '' },
        { text: 'Quiz', to: '' }
      ])
    })

    it('returns quiz store instance', () => {
      expect(wrapper.vm.quizStore).toBe(quizStore)
    })

    it('returns user store instance', () => {
      expect(wrapper.vm.userStore).toBe(userStore)
    })
  })

  describe('Error Handling', () => {
    it('handles submit quiz error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockRouter.push.mockRejectedValueOnce(new Error('Navigation failed'))
      
      await wrapper.vm.submitQuiz()
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to submit quiz:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
}) 