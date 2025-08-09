<template>
  <div class="wave"></div>
</template>

<style lang="scss" scoped>
.wave {
  background-image: url(@/assets/blue_light_wave_top.svg);
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  height: 100%;
  width: 100%;
  max-height: 400px;
}
</style>
