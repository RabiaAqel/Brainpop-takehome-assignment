<template>
  <div v-if="error" class="error-display" :class="variant">
    <div class="error-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>
    </div>
    
    <div class="error-content">
      <h4 v-if="title" class="error-title">{{ title }}</h4>
      <p class="error-message">{{ getUserFriendlyMessage(error) }}</p>
      
      <div v-if="showDetails && error.details" class="error-details">
        <details>
          <summary>Technical Details</summary>
          <pre>{{ JSON.stringify(error.details, null, 2) }}</pre>
        </details>
      </div>
    </div>
    
    <button 
      v-if="dismissible" 
      @click="$emit('dismiss')" 
      class="error-dismiss"
      aria-label="Dismiss error"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
      </svg>
    </button>
    
    <div v-if="showRetry && onRetry" class="error-actions">
      <button @click="handleRetry" class="retry-button" :disabled="isRetrying">
        <span v-if="isRetrying">Retrying...</span>
        <span v-else>Try Again</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getUserFriendlyMessage } from '@/utilities/errorHandler'

export default {
  name: 'ErrorDisplay',
  /**
   * Component props for error display configuration
   */
  props: {
    error: {
      type: [Error, Object, String],
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'inline', 'banner'].includes(value)
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    showRetry: {
      type: Boolean,
      default: false
    },
    onRetry: {
      type: Function,
      default: null
    }
  },
  emits: ['dismiss', 'retry'],
  setup(props, { emit }) {
    const isRetrying = ref(false)

    /**
     * Handle retry button click with loading state
     * @returns {Promise<void>}
     */
    const handleRetry = async () => {
      if (!props.onRetry) return
      
      try {
        isRetrying.value = true
        await props.onRetry()
        emit('retry')
      } catch (error) {
        console.error('Retry failed:', error)
      } finally {
        isRetrying.value = false
      }
    }

    return {
      isRetrying,
      handleRetry,
      getUserFriendlyMessage
    }
  }
}
</script>

<style lang="scss" scoped>
.error-display {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: var(--color-error-light, #fef2f2);
  border: 1px solid var(--color-error, #dc2626);
  color: var(--color-error-dark, #991b1b);
  
  &.inline {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
  }
  
  &.banner {
    border-radius: 0;
    border-left: 4px solid var(--color-error, #dc2626);
  }
}

.error-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.error-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.error-details {
  margin-top: 12px;
  
  details {
    summary {
      cursor: pointer;
      font-size: 12px;
      color: var(--color-error-dark, #991b1b);
      text-decoration: underline;
      
      &:hover {
        color: var(--color-error, #dc2626);
      }
    }
    
    pre {
      margin: 8px 0 0 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-size: 11px;
      overflow-x: auto;
    }
  }
}

.error-dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--color-error-dark, #991b1b);
  
  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
}

.error-actions {
  margin-top: 12px;
}

.retry-button {
  background: var(--color-error, #dc2626);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: var(--color-error-dark, #991b1b);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Responsive design
@media (max-width: 768px) {
  .error-display {
    flex-direction: column;
    gap: 8px;
  }
  
  .error-dismiss {
    align-self: flex-end;
  }
}
</style>
