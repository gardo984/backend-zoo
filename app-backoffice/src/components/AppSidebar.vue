<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const route = useRoute()

const navItems = [
  { name: 'Users', path: '/users', icon: '👥' },
  { name: 'Categories', path: '/categories', icon: '📂' },
  { name: 'Authors', path: '/authors', icon: '✍️' },
  { name: 'Books', path: '/books', icon: '📚' },
]

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-brand">
      <span class="brand-icon">📖</span>
      <span v-show="!collapsed" class="brand-text">Backoffice</span>
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
        <span v-show="!collapsed" class="nav-label">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="btn-collapse" @click="emit('toggle')" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <span class="collapse-icon">{{ collapsed ? '▶' : '◀' }}</span>
        <span v-show="!collapsed" class="collapse-label">Collapse</span>
      </button>
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
  transition: width 0.25s ease;
  overflow: hidden;

  &.collapsed {
    width: 60px;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
  font-weight: 700;
  font-size: 1.1rem;
  white-space: nowrap;

  .brand-icon {
    font-size: 1.4rem;
    flex-shrink: 0;
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
  white-space: nowrap;

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
    flex-shrink: 0;
  }
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #334155;
}

.btn-collapse {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid #475569;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #334155;
    color: #e2e8f0;
  }

  .collapse-icon {
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .collapse-label {
    white-space: nowrap;
  }
}
</style>
