<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { name: 'Users', path: '/users', icon: '👥' },
  { name: 'Categories', path: '/categories', icon: '📂' },
  { name: 'Authors', path: '/authors', icon: '✍️' },
  { name: 'Books', path: '/books', icon: '📚' },
]

function isActive(path: string): boolean {
  return route.path === path
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-icon">📖</span>
      <span class="brand-text">Backoffice</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <span class="user-email">{{ authStore.currentUser?.email }}</span>
      </div>
      <button class="btn-logout" @click="handleLogout">Sign Out</button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #1e293b;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
  font-weight: 700;
  font-size: 1.1rem;

  .brand-icon {
    font-size: 1.4rem;
  }

  .brand-text {
    color: #f1f5f9;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  color: #94a3b8;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  font-size: 0.95rem;

  &:hover {
    background: #334155;
    color: #e2e8f0;
  }

  &.active {
    background: #2a5298;
    color: #fff;
    font-weight: 600;
  }

  .nav-icon {
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
  }
}

.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #334155;

  .user-info {
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-logout {
    width: 100%;
    padding: 0.5rem;
    background: transparent;
    color: #f87171;
    border: 1px solid #f87171;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: background 0.2s;

    &:hover {
      background: rgba(248, 113, 113, 0.1);
    }
  }
}
</style>
