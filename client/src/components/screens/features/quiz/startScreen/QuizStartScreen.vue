<template>
  <div class="start_container">
    <BackgroundWave />
    <Navigator
      :items="[
        { text: quizInfo?.name || 'Quiz', to: `/feature/quiz` },
        { text: 'Quiz', to: '' }
      ]"
    />
    <main class="start_content">
      <h1>Quiz</h1>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <p>Loading quiz...</p>
      </div>
      
      <!-- Error State -->
      <ErrorDisplay
        v-if="error"
        :error="error"
        title="Failed to Load Quiz"
        :show-retry="true"
        :on-retry="loadQuizInfo"
        @retry="clearError"
      />
      
      <h2 class="capitalize">{{ quizInfo?.name || 'Loading...' }}</h2>
      <h3 class="capitalize">{{ quizInfo?.totalQuestions || 0 }} questions</h3>
      <Jumbotron title="Get Ready" info="Once start you can't go back.">
        <div class="image_container">
          <img src="@/assets/quiz-image-1.png" alt="" width="174" />
          <img src="@/assets/quiz-image-2.png" alt="" width="174" />
        </div>
        <Badge class="badge"></Badge>
        <BaseButton 
          :theme="BUTTON_THEMES.PRIMARY" 
          :disabled="isLoading"
          @click="startQuiz"
        >
          {{ isLoading ? 'Loading...' : 'Start' }}
        </BaseButton>
      </Jumbotron>
    </main>
  </div>
</template>

<script>
import { useQuizStore } from '@/stores/quiz'
import { useUserStore } from '@/stores/user'
// CONFIGURATIONS
import { THEMES as BUTTON_THEMES } from '@/components/base/button/config.js'
import { QUIZ_CONFIG } from '@/utilities/constants'
// COMPONENTS
import BackgroundWave from '@/components/base/backgrounds/wave/BackgroundWave.vue'
import BaseButton from '@/components/base/button/BaseButton.vue'
import ErrorDisplay from '@/components/base/error-display/ErrorDisplay.vue'
import Jumbotron from '@/components/base/jumbotron/Jumbotron.vue'
import Badge from '@/assets/badge.svg?component'
// COMPOSITIONS
import Navigator from '@/components/compositions/navigator/Navigator.vue'

export default {
  name: 'QuizStartScreen',
  emits: ['start'],
  components: { BaseButton, ErrorDisplay, Jumbotron, BackgroundWave, Badge, Navigator },

  data() {
    return {
      BUTTON_THEMES,
      isLoading: false,
      error: null,
      selectedQuizId: QUIZ_CONFIG.DEFAULT_QUIZ_ID
    }
  },
  async mounted() {
    // Load Quiz 1 directly
    await this.loadQuizInfo(1)
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
    }
  },

  methods: {
    async loadQuizInfo(quizId) {
      try {
        this.isLoading = true
        this.error = null
        await this.quizStore.loadQuiz(quizId)
      } catch (error) {
        console.error('Failed to load quiz info:', error)
        this.error = error
      } finally {
        this.isLoading = false
      }
    },

    async startQuiz() {
      if (!this.userStore.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      try {
        this.isLoading = true
        this.error = null
        await this.quizStore.startNewQuiz(this.selectedQuizId)
        this.$emit('start')
      } catch (error) {
        console.error('Failed to start quiz:', error)
        this.error = error
      } finally {
        this.isLoading = false
      }
    },
    
    clearError() {
      this.error = null
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';

.start_container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: $VADER;
}

.start_content {
  margin-block: 100px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1.2rem;
}

.image_container {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  gap: 8px;
  margin-block-end: 15px;
}

.badge {
  margin-block-start: -45px;
  background: white;
  border-radius: 50px;
  padding: 6px;
}

.loading-state {
  text-align: center;
  color: $VADER;
  font-style: italic;
}
</style>
