<template>
  <div class="quiz-navigation">
    <BaseButton 
      v-if="showBackButton"
      :theme="BUTTON_THEMES.SECONDARY"
      @click="$emit('back')"
      class="back-button"
    >
      Back
    </BaseButton>
    
    <BaseButton 
      :theme="BUTTON_THEMES.PRIMARY"
      :disabled="!isNextEnabled"
      @click="$emit('next')"
      class="next-button"
    >
      {{ nextButtonText }}
    </BaseButton>
  </div>
</template>

<script>
// CONFIGURATIONS
import { THEMES as BUTTON_THEMES } from '@/components/base/button/config.js'

// COMPONENTS
import BaseButton from '@/components/base/button/BaseButton.vue'

export default {
  name: 'QuizNavigation',
  components: { BaseButton },
  emits: ['back', 'next'],
  props: {
    showBackButton: {
      type: Boolean,
      default: false
    },
    isNextEnabled: {
      type: Boolean,
      default: false
    },
    nextButtonText: {
      type: String,
      default: 'Next'
    }
  },
  data() {
    return {
      BUTTON_THEMES
    }
  }
}
</script>

<style lang="scss" scoped>
.quiz-navigation {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
  
  .next-button,
  .back-button {
    min-width: 120px; 
  }
}

</style> 