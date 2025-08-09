<template>
  <main class="login_content">
    <logo />
    <LoginForm 
      :error="error" 
      @submit="submit($event)"
      @clear-error="$emit('clear-error')"
    ></LoginForm>
  </main>
</template>

<script>
// COMPONENTS
import Logo from '@/components/base/logo/Logo.vue'
import LoginForm from '@/components/compositions/forms/login/LoginForm.vue'

export default {
  name: 'LoginScreen',
  emits: ['submit', 'clear-error'],
  props: {
    error: {
      type: String,
      default: null
    }
  },
  components: {
    Logo,
    LoginForm
  },
  data() {
    return {}
  },
  methods: {
    submit(credentials) {
      this.$emit('submit', credentials)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';
.login_content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 782px;
  background: #fff;
  box-shadow: 0px 4px 4px 3px rgba(185, 185, 185, 0.2509803922);
  flex-direction: column;
  padding: 35px 0;
  height: -webkit-fill-available;
}
</style>
