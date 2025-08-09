import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Feature from '../views/Feature.vue'

import { useUserStore } from '@/stores/user'

const isLoggedIn = () => {
  const store = useUserStore()

  return store.isLoggedIn
}

const router = createRouter({
  history: createWebHistory(import.meta?.env?.BASE_URL || '/'),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: () => {
        if (isLoggedIn()) {
          return '/feature/quiz'
        } else {
          return '/login'
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/feature/:type?',
      name: 'feature',
      component: Feature,
      meta: { requiresAuth: true }
    },
    {
      path: '/feature/quiz/results',
      name: 'quiz-results',
      component: Feature,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(to => {
  // BLOCK LOGIN FOR LOGGED IN USERS
  if (to.name === 'login' && isLoggedIn()) {
    return '/'
  }

  // REDIRECT TO LOGIN IF NOT LOGGED IN AND PAGE AUTH REQUIRED
  if (to.meta?.requiresAuth && !isLoggedIn()) {
    return '/login'
  }
})

export default router
