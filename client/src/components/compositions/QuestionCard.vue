<template>
  <div class="question-card">
    <QuestionText 
      :text="question.text" 
      :question-number="questionNumber" 
    />
    <div class="options-container">
      <SelectableOption
        v-for="(option, index) in question.options"
        :key="option.id"
        :text="option.text"
        :letter="getLetter(index)"
        :is-selected="selectedOptionId === option.id"
        :is-correct="option.is_correct"
        :readonly="readonly"
        @select="handleOptionSelect(option)"
      />
    </div>
  </div>
</template>

<script>
import QuestionText from '@/components/base/question-text/QuestionText.vue'
import SelectableOption from '@/components/base/selectable-option/SelectableOption.vue'

export default {
  name: 'QuestionCard',
  components: {
    QuestionText,
    SelectableOption
  },
  props: {
    question: {
      type: Object,
      required: true
    },
    questionNumber: {
      type: [Number, String],
      required: true
    },
    selectedOptionId: {
      type: [Number, String],
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['option-selected'],
  methods: {
    getLetter(index) {
        // calculate the letter - A, B, C, D...
      return String.fromCharCode(65 + index)
    },
    handleOptionSelect(option) {
      if (!this.readonly) {
        this.$emit('option-selected', option)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.question-card {
  width: 600px; // Fixed width - all cards exactly the same size
  margin: 0 auto;
  padding: var(--card-padding);
  
  .options-container {
    margin-top: var(--quiz-question-spacing);
    display: flex;
    flex-direction: column;
    gap: var(--quiz-option-spacing);
  }
}

// Responsive design
@media (max-width: 768px) {
  .question-card {
    width: calc(100vw - 2 * var(--spacing-4)); // Full width minus padding, all same size
    max-width: 600px; // Don't exceed desktop size
    margin: 0 var(--spacing-4);
    padding: var(--spacing-4);
    
    .options-container {
      margin-top: var(--spacing-6);
      gap: var(--spacing-3);
    }
  }
}

@media (max-width: 480px) {
  .question-card {
    width: calc(100vw - 2 * var(--spacing-2)); // Full width minus padding, all same size
    margin: 0 var(--spacing-2);
    padding: var(--spacing-3);
  }
}
</style> 