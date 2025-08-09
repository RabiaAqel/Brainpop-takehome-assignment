<template>
  <div class="secondary-header"></div>
</template>

<script>
export default {
  name: 'SecondaryHeader'
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';

.secondary-header {
  position: fixed;
  top: 60px; 
  left: 0;
  right: 0;
  height: 50px;
  background-color: $FISH_MILK;
  border-bottom: 2px solid $URBAN_MIST;
  z-index: 100;
}
</style> 