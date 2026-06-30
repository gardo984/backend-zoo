<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/AppSidebar.vue'

const authStore = useAuthStore()
</script>

<template>
  <div class="app-layout" :class="{ 'has-sidebar': authStore.isAuthenticated }">
    <AppSidebar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
}

.main-content {
  flex: 1;
  margin-left: 240px;
}

.app-layout:not(.has-sidebar) .main-content {
  margin-left: 0;
}
</style>
