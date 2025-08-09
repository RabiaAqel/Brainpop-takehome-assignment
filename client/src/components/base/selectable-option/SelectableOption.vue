<template>
  <div class="option-container">
    <div 
      class="selectable-option"
      :class="{ 
        'selected': isSelected,
        'readonly': readonly,
        'correct': readonly && isSelected && isCorrect === true,
        'incorrect': readonly && isSelected && isCorrect === false
      }"
      @click="handleClick"
    >
      <div class="option-letter">{{ letter }}</div>
      <div class="option-text">{{ text }}</div>
    </div>
    <div v-if="readonly && isSelected && typeof isCorrect === 'boolean'" class="result-icon">
      <CheckCircle v-if="isCorrect" class="svg-icon correct-svg" />
      <TimesCircle v-else class="svg-icon incorrect-svg" />
    </div>
  </div>
</template>

<script>
import CheckCircle from '@/assets/check_circle.svg?component'
import TimesCircle from '@/assets/times_circle.svg?component'

export default {
  name: 'SelectableOption',
  components: { CheckCircle, TimesCircle },
  props: {
    text: {
      type: String,
      required: true
    },
    letter: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isCorrect: {
      type: [Boolean, undefined],
      default: undefined
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  methods: {
    handleClick() {
      if (!this.readonly) {
        this.$emit('select')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.option-container {
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;
}

.selectable-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background-white);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  box-shadow: var(--shadow-sm);
  flex: 1;
  
  &:hover:not(.readonly) {
    outline: 2px solid var(--color-hover-border);
    outline-offset: 1px;
  }
  
  &.readonly {
    cursor: default;
    &:not(.selected) {
      opacity: 0.6;
    }
  }
  
  &.selected:not(.correct):not(.incorrect) {
    border-color: var(--color-border);
    background: var(--color-success-light);
    .option-letter {
      background: var(--color-success-light);
      color: var(--color-text-primary);
      border-color: var(--color-success);
    }
  }
  
  &.correct {
    border-color: var(--color-success); 
    background: var(--color-success-light); 
    .option-letter {
      background: var(--color-success-light);
      color: var(--color-text-primary);
      border-color: var(--color-success);
    }
  }
  
  &.incorrect {
    border-color: var(--color-danger);
    background: var(--color-danger-light);
    .option-letter {
      background: var(--color-success-light);
      color: var(--color-text-primary);
      border-color: var(--color-success);
    }
  }
  .option-letter {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-background-white);
    color: var(--color-text-primary);
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    font-family: var(--font-family-primary);
    flex-shrink: 0;
    transition: all var(--transition-fast);
  }
  
  .option-text {
    font-family: var(--font-family-primary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    flex: 1;
  }
}
.result-icon {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .svg-icon {
    width: 16px;
    height: 16px;
    display: block;
  }
  
  .correct-svg {
    color: var(--color-success);
  }
  
  .incorrect-svg {
    color: var(--color-danger);
  }
}

@media (max-width: 768px) {
  .selectable-option {
    padding: var(--spacing-3);
    gap: var(--spacing-2);
    
    .option-letter {
      width: 28px;
      height: 28px;
      font-size: var(--font-size-sm);
    }
    
    .option-text {
      font-size: var(--font-size-sm);
    }
  }
  
  .result-icon .svg-icon {
    width: 14px;
    height: 14px;
  }
}
</style> 