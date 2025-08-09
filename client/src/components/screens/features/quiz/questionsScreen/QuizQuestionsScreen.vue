<template>
  <div class="quiz-questions-container">
    <BackgroundWhite />
    <Navigator :items="breadcrumbItems" />
    
    <SecondaryHeader />
    
    <main class="quiz-content">
      <div v-if="quizStore.isLoading" class="loading">
        Loading questions...
      </div>
      
      <ErrorDisplay
        v-else-if="quizStore.hasError"
        :error="quizStore.error"
        title="Quiz Error"
        :show-retry="true"
        :on-retry="retryQuiz"
        variant="banner"
      />
      
      <QuestionCard
        v-else
        :question="quizStore.currentQuestion"
        :question-number="currentQuestionIndex + 1"
        :selected-option-id="quizStore.getSelectedAnswer(quizStore.currentQuestion.id)"
        @option-selected="handleOptionSelected"
      />
    </main>
    
    <hr class="footer-separator" />
    
    <QuizNavigation
      :show-back-button="!quizStore.isFirstQuestion"
      :is-next-enabled="quizStore.isQuestionAnswered(quizStore.currentQuestion?.id)"
      :next-button-text="quizStore.isLastQuestion ? 'Submit' : 'Next'"
      @back="handlePrevious"
      @next="handleNext"
    />
  </div>
</template>

<script>
// COMPONENTS
import BackgroundWhite from '@/components/base/backgrounds/white/BackgroundWhite.vue'
import ErrorDisplay from '@/components/base/error-display/ErrorDisplay.vue'
import Navigator from '@/components/compositions/navigator/Navigator.vue'
import SecondaryHeader from '@/components/base/secondary-header/SecondaryHeader.vue'

// COMPOSITIONS
import QuizNavigation from '@/components/compositions/quiz-navigation/QuizNavigation.vue'
import QuestionCard from '@/components/compositions/QuestionCard.vue'

// STORES
import { useQuizStore } from '@/stores/quiz'
import { useUserStore } from '@/stores/user'

export default {
  name: 'QuizQuestionsScreen',
  components: { 
    BackgroundWhite,
    ErrorDisplay,
    Navigator,
    QuestionCard,
    QuizNavigation,
    SecondaryHeader
  },
  computed: {
    quizStore() {
      return useQuizStore()
    },
    quizInfo() {
      return this.quizStore.quizInfo
    },
    userStore() {
      return useUserStore()
    },
    breadcrumbItems() {
      return [
        { text: this.quizInfo?.name || 'Quiz', to: '' },
        { text: 'Quiz', to: '' }
      ]
    },
    currentQuestionIndex() {
      return this.quizStore.currentIndex
    }
  },
  methods: {
    handleOptionSelected(option) {
      this.quizStore.selectAnswer(this.quizStore.currentQuestion.id, option.id)
    },
    
    handleNext() {
      if (this.quizStore.isLastQuestion) {
        this.submitQuiz()
      } else {
        this.quizStore.nextQuestion()
      }
    },
    
    handlePrevious() {
      this.quizStore.previousQuestion()
    },
    
    async submitQuiz() {
      try {
        this.quizStore.goToSummary()
        this.$router.push('/feature/quiz/results')
      } catch (error) {
        console.error('Failed to submit quiz:', error)
      }
    },
    
    async retryQuiz() {
      try {
        await this.quizStore.loadQuestions(this.quizStore.quizInfo.id)
      } catch (error) {
        console.error('Failed to retry quiz:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';

.quiz-questions-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  color: $VADER;
  position: relative;
}

.quiz-content {
  margin-top: 150px;
  margin-bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1.2rem;
  padding: 0 20px;
}

.loading {
  font-size: 18px;
  color: $GRAY2;
  text-align: center;
}





.footer-separator {
  position: fixed;
  bottom: 75px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: $URBAN_MIST;
  border: none;
  margin: 0;
  z-index: 50;
}
</style>
