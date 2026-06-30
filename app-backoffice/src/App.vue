<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/AppSidebar.vue'
import TopBar from './components/TopBar.vue'

const authStore = useAuthStore()
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="app-layout" :class="{ 'has-sidebar': authStore.isAuthenticated }">
    <AppSidebar
      v-if="authStore.isAuthenticated"
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />
    <div class="main-area" :class="{ collapsed: sidebarCollapsed }">
      <TopBar v-if="authStore.isAuthenticated" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
}

.main-area {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.25s ease;

  &.collapsed {
    margin-left: 60px;
  }
}

.app-layout:not(.has-sidebar) .main-area {
  margin-left: 0;
}

.main-content {
  flex: 1;
}
</style>
