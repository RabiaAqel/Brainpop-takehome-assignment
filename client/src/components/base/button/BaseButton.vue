<template>
  <button 
    :class="[
      'base-button',
      `base-button--${theme}`,
      { 
        'base-button--full-width': fullWidth,
        'base-button--disabled': disabled
      }
    ]" 
    :disabled="disabled" 
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<script>
import { THEMES } from './config.js'
export default {
  name: 'BaseButton',
  emits: ['click'],
  props: {
    value: {
      type: String,
      default: ''
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: THEMES.PRIMARY
    }
  },
  methods: {
    onClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.base-button {
  // Use design tokens for consistent styling
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  
  cursor: pointer;
  transition: all var(--transition-fast);
  
  // Focus styles for accessibility
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--input-focus-ring-color);
  }
  
  // Primary theme (default)
  &--PRIMARY {
    background-color: var(--color-primary);
    color: var(--color-background-white);
    border-color: var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }
  }
  
  // Secondary theme
  &--SECONDARY {
    background-color: var(--color-background-white);
    color: var(--color-primary);
    border-color: var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-light);
    }
  }
  
  // Full width modifier
  &--full-width {
    width: 100%;
  }
  
  // Disabled state - needs to override theme-specific hover styles
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    // Override hover effects for all themes when disabled
    &:hover,
    &:active,
    &:focus {
      opacity: 0.5 !important;
    }
    
    // Primary disabled state
    &.base-button--PRIMARY {
      background-color: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
      color: var(--color-background-white) !important;
      
      &:hover,
      &:active,
      &:focus {
        background-color: var(--color-primary) !important;
        border-color: var(--color-primary) !important;
        color: var(--color-background-white) !important;
      }
    }
    
    // Secondary disabled state
    &.base-button--SECONDARY {
      background-color: var(--color-background-white) !important;
      border-color: var(--color-primary) !important;
      color: var(--color-primary) !important;
      
      &:hover,
      &:active,
      &:focus {
        background-color: var(--color-background-white) !important;
        border-color: var(--color-primary) !important;
        color: var(--color-primary) !important;
      }
    }
  }
}
</style>
