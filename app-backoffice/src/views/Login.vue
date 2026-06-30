<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Missing fields',
      text: 'Please enter both email and password.',
      confirmButtonColor: '#3085d6',
    })
    return
  }

  // Hardcoded check for demo
  if (password.value !== '123456') {
    await Swal.fire({
      icon: 'error',
      title: 'Invalid Credentials',
      text: 'The password must be 123456.',
      confirmButtonColor: '#d33',
    })
    return
  }

  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push('/users')
  } catch (err: any) {
    const detail = err.response?.data?.detail || 'Login failed. Please try again.'
    await Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: Array.isArray(detail) ? detail.join(', ') : detail,
      confirmButtonColor: '#d33',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>Backoffice</h1>
        <p>Library Management System</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            required
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: #1e3c72;
  }

  p {
    margin: 0.25rem 0 0;
    color: #6c757d;
    font-size: 0.9rem;
  }
}

.field {
  margin-bottom: 1.25rem;

  label {
    display: block;
    margin-bottom: 0.35rem;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      border-color: #2a5298;
      outline: none;
      box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.15);
    }
  }
}

.btn-primary {
  width: 100%;
  padding: 0.7rem;
  background: #1e3c72;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2a5298;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
