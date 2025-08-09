<template>
  <div class="login_container">
    <LoginScreen 
      :error="error" 
      @submit="submit($event)"
      @clear-error="clearError"
    ></LoginScreen>
  </div>
</template>

<script>
// SCREEN
import LoginScreen from '@/components/screens/login/LoginScreen.vue'
//STORE
import { useUserStore } from '@/stores/user'
export default {
  name: 'Login',
  components: {
    LoginScreen
  },
  data() {
    return {
      error: null
    }
  },
  methods: {
    async submit(credentials) {
      this.error = null 
      const store = useUserStore()
      
      try {
        const result = await store.login(credentials)
        if (result.success) {
          this.$router.push({ name: 'home' })
        } else {
          this.error = result.error
        }
      } catch (error) {
        this.error = error.message || 'Login failed. Please try again.'
      }
    },
    clearError() {
      this.error = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/utilities/css/vars/vars.scss';
.login_container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  height: 100vh;
}
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
