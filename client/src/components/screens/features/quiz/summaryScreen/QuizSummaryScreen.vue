<template>
  <div class="quiz-summary-container">
    <BackgroundWhite />
    <Navigator :items="breadcrumbItems" />
    <SecondaryHeader />
    
    <main class="summary-content">
      <div v-if="loading" class="loading">
        Loading results...
      </div>
      
      <ErrorDisplay
        v-else-if="error"
        :error="error"
        title="Failed to Load Results"
        :show-retry="true"
        :on-retry="loadQuizResults"
        variant="banner"
      />
      
      <template v-else>
        <ScoreHeader :score="score" :total="totalQuestions" />
        
        <div class="questions-results">
          <QuestionCard
            v-for="(question, index) in questions"
            :key="question.id"
            :question="getQuestionWithResults(question)"
            :question-number="index + 1"
            :selected-option-id="selectedAnswers[question.id]"
            :readonly="true"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import { useQuizStore } from '@/stores/quiz'
import { computed, ref, onMounted } from 'vue'

// COMPONENTS
import BackgroundWhite from '@/components/base/backgrounds/white/BackgroundWhite.vue'
import ErrorDisplay from '@/components/base/error-display/ErrorDisplay.vue'
import Navigator from '@/components/compositions/navigator/Navigator.vue'
import ScoreHeader from '@/components/base/score-header/ScoreHeader.vue'
import QuestionCard from '@/components/compositions/QuestionCard.vue'
import SecondaryHeader from '@/components/base/secondary-header/SecondaryHeader.vue'

export default {
  name: 'QuizSummaryScreen',
  components: { 
    BackgroundWhite,
    ErrorDisplay,
    Navigator,
    ScoreHeader,
    QuestionCard,
    SecondaryHeader
  },
  setup() {
    const quizStore = useQuizStore()
    
    // Reactive state
    const loading = ref(false)
    const error = ref(null)
    const questions = ref([])
    const selectedAnswers = ref({})
    const answerResults = ref({})
    const score = ref(0)
    const totalQuestions = ref(0)

    // Computed properties
    const breadcrumbItems = computed(() => {
      const quizName = quizStore.quizName || 'Quiz'
      return [
        { text: quizName },
        { text: 'Quiz' },
        { text: 'Summary' }
      ]
    })

    const hasStoreResults = computed(() => quizStore.hasResults)

    // Methods
    const loadResultsFromStore = () => {
      const scoreData = quizStore.getScore()
      totalQuestions.value = scoreData.total
      score.value = scoreData.correct
      questions.value = quizStore.questions
      selectedAnswers.value = quizStore.answers
      
      // Extract answer results from store
      answerResults.value = {}
      if (quizStore.quizResults.answers?.length > 0) {
        quizStore.quizResults.answers.forEach(answer => {
          answerResults.value[answer.question_id] = answer.is_correct
        })
      }
    }

    const loadResultsFromServer = async () => {
      const results = await quizStore.loadQuizResults(1)
      totalQuestions.value = results.total_questions || 0
      score.value = results.correct_answers || 0
      
      await quizStore.loadQuestions(1)
      questions.value = quizStore.questions
      
      selectedAnswers.value = {}
      answerResults.value = {}
      if (results.options) {
        results.options.forEach(option => {
          selectedAnswers.value[option.question_id] = option.option_id
          answerResults.value[option.question_id] = option.is_correct
        })
      }
      
      quizStore.questions = questions.value
      quizStore.answers = selectedAnswers.value
    }

    const loadQuizResults = async () => {
      try {
        loading.value = true
        error.value = null
        
        if (hasStoreResults.value) {
          loadResultsFromStore()
        } else {
          await loadResultsFromServer()
        }
      } catch (err) {
        console.error('Error loading quiz results:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const getQuestionWithResults = (question) => {
      const selectedOptionId = selectedAnswers.value[question.id]
      const isCorrect = answerResults.value[question.id]
      
      if (selectedOptionId === undefined || isCorrect === undefined) {
        return question
      }
      
      return {
        ...question,
        options: question.options.map(option => ({
          ...option,
          is_correct: option.id === selectedOptionId ? isCorrect : undefined
        }))
      }
    }

    // Lifecycle
    onMounted(loadQuizResults)

    return {
      // State
      loading,
      error,
      questions,
      selectedAnswers,
      score,
      totalQuestions,
      
      // Computed
      breadcrumbItems,
      
      // Methods
      getQuestionWithResults
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';

.quiz-summary-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: $VADER;
  position: relative;
}

.summary-content {
  margin-top: 180px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1.2rem;
  max-width: 800px;
  padding: 0 20px;
  overflow: visible;
}

.loading {
  font-size: 18px;
  color: $GRAY2;
  text-align: center;
}



.questions-results {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style> 