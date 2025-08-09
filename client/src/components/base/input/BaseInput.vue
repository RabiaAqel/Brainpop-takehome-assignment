<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">{{ label }}:</label>
    <input 
      class="base-input__field" 
      :value="modelValue" 
      :type="type" 
      :placeholder="placeholder" 
      @input="$emit('update:modelValue', $event.target.value)" 
    />
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: String,
      required: false
    },
    type: {
      type: String,
      required: false
    },
    label: {
      type: String,
      required: false,
      default: 'label'
    },
    placeholder: {
      type: String,
      required: false
    }
  }
}
</script>

<style lang="scss" scoped>
.base-input {
  width: 100%;
  
  &__label {
    display: block;
    font-family: var(--font-family-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-2);
  }
  
  &__field {
    width: 100%;
    padding: var(--input-padding-y) var(--input-padding-x);
    border: var(--input-border-width) solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-family-primary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    background-color: var(--color-background-white);
    transition: all var(--transition-fast);
    outline: none;
    
    &::placeholder {
      color: var(--color-text-muted);
    }
    
    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 var(--input-focus-ring-width) var(--input-focus-ring-color);
    }
    
    &:hover:not(:focus) {
      border-color: var(--color-secondary);
    }
    
    // Error state (can be extended later)
    &--error {
      border-color: var(--color-danger);
      
      &:focus {
        border-color: var(--color-danger);
        box-shadow: 0 0 0 var(--input-focus-ring-width) rgb(239 68 68 / 0.2);
      }
    }
  }
}
</style>
