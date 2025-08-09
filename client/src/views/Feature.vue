<template>
  <div class="feature_container">
    <div v-if="supportedFeatures[featureType] && !currentComponent" class="loading">
      Loading {{ featureType }} feature...
    </div>
    <component v-else-if="supportedFeatures[featureType] && currentComponent" :is="currentComponent" />
    <span v-else>{{ featureType }} feature is NOT supported YET</span>
  </div>
</template>

<script>
import { markRaw } from 'vue'

export default {
  name: 'Feature',
  components: {},
  data() {
    return {
      supportedFeatures: {
        quiz: true
      },
      featureType: 'quiz',
      currentComponent: null
    }
  },

  async mounted() {
    this.featureType = this.$route.params.type?.toLowerCase() || this.featureType.toLowerCase()
    
    if (this.supportedFeatures[this.featureType]) {
      await this.loadFeatureComponent()
    }
  },
  
  methods: {
    async loadFeatureComponent() {
      try {
        if (this.featureType === 'quiz') {
          const { default: Quiz } = await import('@/components/screens/features/quiz/Quiz.vue')
          this.currentComponent = markRaw(Quiz)
        }
      } catch (error) {
        console.error('Failed to load feature component:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.feature_container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
