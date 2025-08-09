<template>
  <form class="login_form" @submit.prevent="submit">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <BaseInput 
      v-model="email" 
      label="Username" 
      type="email" 
      @input="clearError"
    />
    <BaseInput 
      v-model="password" 
      label="Password" 
      type="password" 
      @input="clearError"
    />
    <BaseButton type="submit" fullWidth>Log in</BaseButton>
  </form>
</template>

<script>
// COMPONENTS
import BaseInput from '@/components/base/input/BaseInput.vue'
import BaseButton from '@/components/base/button/BaseButton.vue'

export default {
  name: 'LoginForm',
  emits: ['submit', 'clear-error'],
  props: {
    error: {
      type: String,
      default: null
    }
  },
  components: {
    BaseInput,
    BaseButton
  },
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    submit() {
      this.$emit('submit', {
        email: this.email,
        password: this.password
      })
    },
    clearError() {
      if (this.error) {
        this.$emit('clear-error')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';

.login_form {
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: $ESSENTIALS_BLUE2;
  margin-block-start: 50px;
}

.error-message {
  background-color: $ERROR_MESSAGE_BACKGROUND;
  color: $ERROR_MESSAGE;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid $ERROR_MESSAGE_BACKGROUND_HOVER;
  font-size: 14px;
  text-align: center;
  width: 100%;
  margin-bottom: 8px;
}
</style>
