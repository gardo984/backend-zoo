<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users'
import type { UserResponse, UserUpdate } from '../types'

const users = ref<UserResponse[]>([])
const loading = ref(false)

const searchTerm = ref('')
const statusFilter = ref<'all' | 'true' | 'false'>('all')
const offset = ref(0)
const ITEMS_PER_PAGE = 20

const hasPrevious = computed(() => offset.value > 0)
const hasNext = computed(() => users.value.length === ITEMS_PER_PAGE)

function buildParams() {
  const params: Record<string, any> = { offset: offset.value }
  if (searchTerm.value) params.search = searchTerm.value
  if (statusFilter.value !== 'all') params.status = statusFilter.value === 'true'
  return params
}

async function handleSearch() {
  offset.value = 0
  await loadUsers()
}

function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleSearch()
}

async function handleStatusChange() {
  offset.value = 0
  await loadUsers()
}

async function goNext() {
  offset.value += ITEMS_PER_PAGE
  await loadUsers()
}

async function goPrevious() {
  offset.value = Math.max(0, offset.value - ITEMS_PER_PAGE)
  await loadUsers()
}

const showModal = ref(false)
const editEmail = ref('')
const editPassword = ref('')
const editDisabled = ref(false)
const editingId = ref<number | null>(null)

onMounted(() => loadUsers())

async function loadUsers() {
  loading.value = true
  try {
    users.value = await fetchUsers(buildParams())
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to load users.' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  editEmail.value = ''
  editPassword.value = ''
  editDisabled.value = false
  showModal.value = true
}

function openEdit(u: UserResponse) {
  editingId.value = u.id
  editEmail.value = u.email
  editPassword.value = ''
  editDisabled.value = u.disabled
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function handleSave() {
  if (!editEmail.value) {
    await Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Email is required.' })
    return
  }
  try {
    if (editingId.value) {
      const payload: UserUpdate = { email: editEmail.value }
      if (editPassword.value) payload.password = editPassword.value
      payload.disabled = editDisabled.value
      await updateUser(editingId.value, payload)
      await Swal.fire({ icon: 'success', title: 'Updated', timer: 1500, showConfirmButton: false })
    } else {
      if (!editPassword.value || editPassword.value.length < 8) {
        await Swal.fire({ icon: 'warning', title: 'Password too short', text: 'Password must be at least 8 characters.' })
        return
      }
      await createUser({ email: editEmail.value, password: editPassword.value })
      await Swal.fire({ icon: 'success', title: 'Created', text: 'User created successfully.', timer: 1500, showConfirmButton: false })
    }
    closeModal()
    await loadUsers()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Operation failed.' })
  }
}

async function handleDelete(user: UserResponse) {
  const result = await Swal.fire({
    title: 'Delete User?',
    text: `Are you sure you want to delete "${user.email}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete',
  })
  if (!result.isConfirmed) return
  try {
    await deleteUser(user.id)
    await Swal.fire({ icon: 'success', title: 'Deleted', text: 'User removed.', timer: 1500, showConfirmButton: false })
    await loadUsers()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to delete user.' })
  }
}
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>Users</h2>
      <button class="btn btn-primary" @click="openCreate">+ New User</button>
    </div>

    <!-- Search + Status Filter -->
    <div class="search-bar">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by email…"
        class="search-input"
        @keydown="handleSearchKeydown"
      />
      <button class="btn btn-primary" @click="handleSearch">Search</button>
    </div>

    <div class="filter-row">
      <select v-model="statusFilter" class="status-select" @change="handleStatusChange">
        <option value="all">All</option>
        <option value="true">Disabled</option>
        <option value="false">Enabled</option>
      </select>
    </div>

    <div class="records-info">
      Showing {{ offset + 1 }}–{{ offset + users.length }}
      <span v-if="!hasNext"> (last page)</span>
    </div>

    <div v-if="loading" class="loading">Loading…</div>

    <div v-else-if="users.length === 0" class="empty">
      No users found.
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Disabled</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="user.disabled ? 'badge-danger' : 'badge-success'">
              {{ user.disabled ? 'Yes' : 'No' }}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-primary btn-sm" @click="openEdit(user)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(user)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" v-if="users.length > 0">
      <button class="btn btn-secondary btn-sm" :disabled="!hasPrevious" @click="goPrevious">← Previous</button>
      <button class="btn btn-secondary btn-sm" :disabled="!hasNext" @click="goNext">Next →</button>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingId ? 'Edit User' : 'New User' }}</h3>
        <div class="field">
          <label>Email</label>
          <input v-model="editEmail" type="email" placeholder="user@example.com" />
        </div>
        <div class="field">
          <label>Password <span v-if="editingId" class="text-muted">(leave blank to keep)</span></label>
          <input v-model="editPassword" type="password" :placeholder="editingId ? 'Optional' : 'Min 8 characters'" />
        </div>
        <div class="field checkbox-field">
          <label>
            <input v-model="editDisabled" type="checkbox" />
            Disabled
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="handleSave">{{ editingId ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.view-container {
  padding: 1.5rem 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: #1e293b;
  }
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;

  .search-input {
    flex: 1;
    max-width: 360px;
    padding: 0.55rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #2a5298;
      box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.15);
    }
  }
}

.records-info {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.filter-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.status-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #2a5298;
    box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.15);
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

:deep(.text-muted) {
  font-weight: 400;
  font-size: 0.8rem;
  color: #94a3b8;
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: #f8fafc;
    font-weight: 600;
    color: #475569;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #f1f5f9;
  }
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }

  &-primary { background: #1e3c72; color: #fff; }
  &-secondary { background: #64748b; color: #fff; }
  &-danger { background: #dc2626; color: #fff; }
  &-sm { padding: 0.35rem 0.65rem; font-size: 0.8rem; }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  h3 {
    margin: 0 0 1.25rem;
    color: #1e293b;
  }

  .field {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.3rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }

    input {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;

      &:focus {
        border-color: #2a5298;
        outline: none;
        box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.15);
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
}
</style>
