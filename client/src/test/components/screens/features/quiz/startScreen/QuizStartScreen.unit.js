import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useQuizStore } from '@/stores/quiz'
import { useUserStore } from '@/stores/user'
import QuizStartScreen from './QuizStartScreen.vue'

const mockRouter = {
  push: jest.fn()
}

jest.mock('@/components/base/backgrounds/wave/BackgroundWave.vue', () => ({
  name: 'BackgroundWave',
  template: '<div class="background-wave"></div>'
}))

jest.mock('@/components/compositions/navigator/Navigator.vue', () => ({
  name: 'Navigator',
  template: '<div class="navigator"></div>'
}))

jest.mock('@/components/base/button/BaseButton.vue', () => ({
  name: 'BaseButton',
  template: '<button class="base-button" @click="$emit(\'click\')"><slot /></button>',
  props: ['theme', 'disabled'],
  emits: ['click']
}))

jest.mock('@/components/base/jumbotron/Jumbotron.vue', () => ({
  name: 'Jumbotron',
  template: '<div class="jumbotron"><slot /></div>',
  props: ['title', 'info']
}))

// Remove the problematic SVG mock - it will use the global mock

describe('QuizStartScreen', () => {
  let wrapper
  let quizStore
  let userStore
  let pinia

  const mockQuizInfo = {
    id: 2,
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
    // log in
    userStore.token = 'mock-token'
    
    wrapper = mount(QuizStartScreen, {
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

  describe('Rendering', () => {
    it('renders quiz title and question count', () => {
      expect(wrapper.find('h1').text()).toBe('Quiz')
      expect(wrapper.find('h2').text()).toBe('General Knowledge Quiz')
      expect(wrapper.find('h3').text()).toBe('5 questions')
    })

    it('renders jumbotron with correct title and info', () => {
      const jumbotron = wrapper.findComponent({ name: 'Jumbotron' })
      expect(jumbotron.props('title')).toBe('Get Ready')
      expect(jumbotron.props('info')).toBe("Once start you can't go back.")
    })

    it('renders start button with correct text', () => {
      const button = wrapper.findComponent({ name: 'BaseButton' })
      expect(button.text()).toBe('Start')
    })

    it('renders quiz images', () => {
      const images = wrapper.findAll('img')
      expect(images).toHaveLength(2)
      expect(images[0].attributes('src')).toContain('quiz-image-1.png')
      expect(images[1].attributes('src')).toContain('quiz-image-2.png')
    })

    it('shows loading state when isLoading is true', async () => {
      wrapper.vm.isLoading = true
      await wrapper.vm.$nextTick()
      
      const button = wrapper.findComponent({ name: 'BaseButton' })
      expect(button.text()).toBe('Loading...')
      expect(button.props('disabled')).toBe(true)
    })
  })

  describe('Quiz Loading', () => {
    it('loads quiz info on mount', async () => {
      const spy = jest.spyOn(wrapper.vm, 'loadQuizInfo')
      
      await wrapper.vm.$nextTick()
      
      expect(spy).toHaveBeenCalled()
    })

    it('calls quizStore.loadQuiz with correct quiz ID', async () => {
      const spy = jest.spyOn(quizStore, 'loadQuiz')
      
      await wrapper.vm.loadQuizInfo()
      
      expect(spy).toHaveBeenCalledWith(2)
    })

    it('handles loading errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Failed to load quiz')
      
      jest.spyOn(quizStore, 'loadQuiz').mockRejectedValueOnce(error)
      
      await wrapper.vm.loadQuizInfo()
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load quiz info:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('Start Quiz', () => {
    it('redirects to login if user is not logged in', async () => {
      userStore.token = null
      
      await wrapper.vm.startQuiz()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('starts quiz and emits start event when user is logged in', async () => {
      const spy = jest.spyOn(quizStore, 'startNewQuiz')
      
      await wrapper.vm.startQuiz()
      
      expect(spy).toHaveBeenCalledWith(2)
      expect(wrapper.emitted('start')).toBeTruthy()
    })

    it('handles start quiz errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Failed to start quiz')
      
      jest.spyOn(quizStore, 'startNewQuiz').mockRejectedValueOnce(error)
      
      await wrapper.vm.startQuiz()
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to start quiz:', error)
      consoleSpy.mockRestore()
    })

    it('sets loading state during start quiz', async () => {
      jest.spyOn(quizStore, 'startNewQuiz').mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      const startPromise = wrapper.vm.startQuiz()
      
      expect(wrapper.vm.isLoading).toBe(true)
      
      await startPromise
      
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('returns quiz store instance', () => {
      expect(wrapper.vm.quizStore).toBe(quizStore)
    })

    it('returns quiz info from store', () => {
      expect(wrapper.vm.quizInfo).toBe(mockQuizInfo)
    })

    it('returns user store instance', () => {
      expect(wrapper.vm.userStore).toBe(userStore)
    })
  })

  describe('Data Properties', () => {
    it('initializes with correct default values', () => {
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.BUTTON_THEMES).toBeDefined()
    })
  })

  describe('Button Interaction', () => {
    it('calls startQuiz when start button is clicked', async () => {
      const spy = jest.spyOn(wrapper.vm, 'startQuiz')
      const button = wrapper.findComponent({ name: 'BaseButton' })
      
      await button.trigger('click')
      
      expect(spy).toHaveBeenCalled()
    })
  })
}) 