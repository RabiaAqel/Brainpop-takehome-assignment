<template>
  <div class="score-header">
    <h2 class="score-text">Scored {{ score }}/{{ total }}</h2>
  </div>
</template>

<script>
export default {
  name: 'ScoreHeader',
  props: {
    score: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.score-header {
  position: fixed;
  top: 110px; 
  left: 0;
  right: 0;
  background-color: var(--color-primary-light);
  padding: var(--spacing-4);
  text-align: center;
  z-index: var(--z-sticky);
  
  .score-text {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
    font-family: var(--font-family-primary);
  }
}
</style> 