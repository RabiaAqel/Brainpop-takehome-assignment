<template>
  <RouterView />
</template>

<style lang="scss">
@import '@/utilities/css/globals.scss';
@import '@/utilities/css/vars/vars.scss';
body {
  margin: 0;
  font-family: $FONT_REGULAR;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;
}
</style>
