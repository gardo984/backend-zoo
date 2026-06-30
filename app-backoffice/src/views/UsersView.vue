<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { fetchUsers, createUser, deleteUser } from '../api/users'
import type { UserResponse } from '../types'

const users = ref<UserResponse[]>([])
const loading = ref(false)

const showModal = ref(false)
const editEmail = ref('')
const editPassword = ref('')
const isEditing = ref(false)

onMounted(() => loadUsers())

async function loadUsers() {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to load users.' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEditing.value = false
  editEmail.value = ''
  editPassword.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!editEmail.value || !editPassword.value) {
    await Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Email and password are required.' })
    return
  }
  if (editPassword.value.length < 8) {
    await Swal.fire({ icon: 'warning', title: 'Password too short', text: 'Password must be at least 8 characters.' })
    return
  }
  try {
    await createUser({ email: editEmail.value, password: editPassword.value })
    await Swal.fire({ icon: 'success', title: 'Created', text: 'User created successfully.', timer: 1500, showConfirmButton: false })
    closeModal()
    await loadUsers()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to create user.' })
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

    <div v-if="loading" class="loading">Loading…</div>

    <div v-else-if="users.length === 0" class="empty">No users found.</div>

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
            <button class="btn btn-danger btn-sm" @click="handleDelete(user)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>New User</h3>
        <div class="field">
          <label>Email</label>
          <input v-model="editEmail" type="email" placeholder="user@example.com" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="editPassword" type="password" placeholder="Min 8 characters" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="handleSave">Create</button>
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
