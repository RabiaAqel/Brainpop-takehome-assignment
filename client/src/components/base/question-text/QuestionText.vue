<template>
  <div class="question-text">
    <span class="question-number">{{ questionNumber }}</span>
    <span class="question-content">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: 'QuestionText',
  props: {
    text: {
      type: String,
      required: true
    },
    questionNumber: {
      type: [Number, String],
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';
.question-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  
  .question-number {
    font-size: 32px;
    font-weight: bold;
    color: $VADER;
    min-width: 30px;
  }
  
  .question-content {
    font-size: 18px;
    line-height: 1.5;
    color: $VADER;
    flex: 1;
  }
}
</style> 