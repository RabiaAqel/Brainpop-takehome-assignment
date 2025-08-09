<template>
  <div class="navigation">
    <Logo color="white" width="100px" />
    <BreadCrumbs color="white" :items="items" />
  </div>
</template>

<script>
import Logo from '@/components/base/logo/Logo.vue'
import BreadCrumbs from '@/components/base/breadcrumbs/BreadCrumbs.vue'

export default {
  name: 'Navigator',
  components: { Logo, BreadCrumbs },
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [{ text: 'Item', to: '/' }]
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.navigation {
  background: teal;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  display: flex;
  gap: 0.5rem;
  z-index: 50;
}
</style>
