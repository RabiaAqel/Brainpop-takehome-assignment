<template>
  <div class="input_container">
    <label v-if="label" class="label">{{ label }}:</label>
    <input 
      class="input_field" 
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
@import '@/utilities/css/vars/vars.scss';

.input_container {
  width: 100%;
}
.label {
  font-family: $FONT_BOLD;
  font-size: large;
}
  
.input_field {
  width: 97%;
  border: $BORDER;
  border-radius: 6px;
  font-size: 18px;
  height: 34px;
  outline: none;
  padding-inline-start: 6px;
  &:focus-visible {
    box-shadow: 0 0 0 2px $WHITE, 0 0 0 4px $BLUE_FOCUS;
  }  
}
</style>
