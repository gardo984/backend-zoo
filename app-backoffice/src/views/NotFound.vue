<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found.</p>
    <button class="btn btn-primary" @click="router.push('/users')">Go to Dashboard</button>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  color: #475569;

  h1 {
    font-size: 5rem;
    margin: 0;
    color: #1e3c72;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  background: #1e3c72;
  color: #fff;
  &:hover { opacity: 0.85; }
}
</style>
