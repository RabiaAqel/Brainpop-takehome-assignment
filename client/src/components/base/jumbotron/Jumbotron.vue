<template>
  <div class="jumbotron">
    <p v-if="title" class="title">{{ title }}</p>
    <p v-if="info" class="info">{{ info }}</p>
    <slot> </slot>
  </div>
</template>

<script>
export default {
  name: 'Jumbotron',
  props: {
    title: {
      type: String,
      required: false
    },
    info: {
      type: String,
      required: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';
.jumbotron {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 40px;
  background: $WHITE;
  border: $BORDER_THIN;
  box-shadow: 2px 2px 0px 0px rgba(204, 204, 204, 0.1);
  border-radius: 8px;
  flex: 1;
  .title {
    font-family: $FONT_BOLD;
    font-size: 20px;
    margin-block-end: 0;
  }
  .info {
    font-size: 18px;
  }
}
</style>
