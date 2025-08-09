<template>
  <div class="logo" v-html="Logo"></div>
</template>

<script>
import Logo from '@/assets/logo.svg?raw'

export default {
  name: 'Logo',
  data() {
    return {
      Logo
    }
  },
  props: {
    color: {
      type: String,
      required: false,
      default: 'black'
    },
    width: {
      type: String,
      required: false,
      default: 'initial'
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  fill: v-bind(color);
  :deep(svg) {
    width: v-bind(width);
  }
}
</style>
