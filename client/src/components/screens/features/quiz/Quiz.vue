<template>
  <div class="quiz-container">
    <QuizStartScreen 
      v-if="currentScreen === QUIZ_STATES.START" 
      @start="handleStartQuiz" 
    />
    <QuizQuestionsScreen 
      v-else-if="currentScreen === QUIZ_STATES.QUESTIONS" 
    />
    <QuizSummaryScreen 
      v-else-if="currentScreen === QUIZ_STATES.SUMMARY" 
    />
  </div>
</template>

<script>
import { useQuizStore } from '@/stores/quiz'
import QuizStartScreen from './startScreen/QuizStartScreen.vue'
import QuizQuestionsScreen from './questionsScreen/QuizQuestionsScreen.vue'
import QuizSummaryScreen from './summaryScreen/QuizSummaryScreen.vue'

const QUIZ_STATES = {
  START: 'start',
  QUESTIONS: 'questions',
  SUMMARY: 'summary'
}

export default {
  name: 'Quiz',
  components: {
    QuizStartScreen,
    QuizQuestionsScreen,
    QuizSummaryScreen
  },
  computed: {
    quizStore() {
      return useQuizStore()
    },
    currentScreen() {
      if (this.$route.path === '/feature/quiz/results') {
        return QUIZ_STATES.SUMMARY
      }
      return this.quizStore.currentScreen
    },
    QUIZ_STATES() {
      return QUIZ_STATES
    }
  },

  methods: {
    handleStartQuiz() {
      this.quizStore.ui.screen = QUIZ_STATES.QUESTIONS
    }
  }
}
</script>

<style lang="scss" scoped>
.quiz-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
