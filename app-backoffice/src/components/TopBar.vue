<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const dropdownOpen = ref(false)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleLogout() {
  dropdownOpen.value = false
  authStore.logout()
  router.push('/login')
}

function userInitial(): string {
  const email = authStore.currentUser?.email || ''
  return email.charAt(0).toUpperCase()
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-right">
      <div class="user-menu" @click.stop="toggleDropdown">
        <div class="user-avatar">{{ userInitial() }}</div>
        <div v-if="dropdownOpen" class="dropdown" @click.stop>
          <div class="dropdown-email">{{ authStore.currentUser?.email }}</div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="handleLogout">Sign Out</button>
        </div>
      </div>
    </div>
    <!-- Click-outside catcher -->
    <div v-if="dropdownOpen" class="backdrop" @click="closeDropdown"></div>
  </header>
</template>

<style scoped lang="scss">
.topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 56px;
  padding: 0 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.topbar-right {
  position: relative;
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1e3c72;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  user-select: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
}

.dropdown {
  position: absolute;
  right: 0;
  top: 44px;
  min-width: 200px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1100;
  overflow: hidden;
}

.dropdown-email {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #475569;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.7rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: #dc2626;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #fef2f2;
  }
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
}
</style>
