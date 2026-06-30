<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { fetchAuthors, createAuthor, updateAuthor, deleteAuthor } from '../api/authors'
import type { AuthorResponse } from '../types'

const authors = ref<AuthorResponse[]>([])
const loading = ref(false)

const searchTerm = ref('')
const statusFilter = ref<'all' | 'true' | 'false'>('all')
const offset = ref(0)
const ITEMS_PER_PAGE = 20

const hasPrevious = computed(() => offset.value > 0)
const hasNext = computed(() => authors.value.length === ITEMS_PER_PAGE)

function buildParams() {
  const params: Record<string, any> = { offset: offset.value }
  if (searchTerm.value) params.search = searchTerm.value
  if (statusFilter.value !== 'all') params.status = statusFilter.value === 'true'
  return params
}

async function handleSearch() {
  offset.value = 0
  await loadAuthors()
}

async function handleClear() {
  searchTerm.value = ''
  statusFilter.value = 'all'
  offset.value = 0
  await loadAuthors()
}

function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleSearch()
}

async function handleStatusChange() {
  offset.value = 0
  await loadAuthors()
}

async function goNext() {
  offset.value += ITEMS_PER_PAGE
  await loadAuthors()
}

async function goPrevious() {
  offset.value = Math.max(0, offset.value - ITEMS_PER_PAGE)
  await loadAuthors()
}
const showModal = ref(false)

const editName = ref('')
const editEmail = ref('')
const editAge = ref<number | null>(null)
const editActive = ref(true)
const editingId = ref<number | null>(null)

onMounted(() => loadAuthors())

async function loadAuthors() {
  loading.value = true
  try {
    authors.value = await fetchAuthors(buildParams())
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to load authors.' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  editName.value = ''
  editEmail.value = ''
  editAge.value = null
  editActive.value = true
  showModal.value = true
}

function openEdit(a: AuthorResponse) {
  editingId.value = a.id
  editName.value = a.name
  editEmail.value = a.email
  editAge.value = a.age
  editActive.value = a.active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function handleSave() {
  if (!editName.value.trim() || !editEmail.value.trim() || editAge.value === null) {
    await Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Name, email, and age are required.' })
    return
  }
  const payload = { name: editName.value.trim(), email: editEmail.value.trim(), age: editAge.value, active: editActive.value }
  try {
    if (editingId.value) {
      await updateAuthor(editingId.value, payload)
      await Swal.fire({ icon: 'success', title: 'Updated', timer: 1500, showConfirmButton: false })
    } else {
      await createAuthor(payload)
      await Swal.fire({ icon: 'success', title: 'Created', timer: 1500, showConfirmButton: false })
    }
    closeModal()
    await loadAuthors()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Operation failed.' })
  }
}

async function handleDelete(a: AuthorResponse) {
  const result = await Swal.fire({
    title: 'Delete Author?',
    text: `Are you sure you want to delete "${a.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete',
  })
  if (!result.isConfirmed) return
  try {
    await deleteAuthor(a.id)
    await Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false })
    await loadAuthors()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to delete author.' })
  }
}
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>Authors</h2>
      <button class="btn btn-primary" @click="openCreate">+ New Author</button>
    </div>

    <!-- Search + Status Filter -->
    <div class="search-bar">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by name or email…"
        class="search-input"
        @keydown="handleSearchKeydown"
      />
      <button class="btn btn-primary" @click="handleSearch">Search</button>
      <button class="btn btn-secondary" @click="handleClear">Clear</button>
    </div>

    <div class="filter-row">
      <select v-model="statusFilter" class="status-select" @change="handleStatusChange">
        <option value="all">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <div class="records-info">
      Showing {{ offset + 1 }}–{{ offset + authors.length }}
      <span v-if="!hasNext"> (last page)</span>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="authors.length === 0" class="empty">
      No authors found.
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Age</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in authors" :key="a.id">
          <td>{{ a.id }}</td>
          <td>{{ a.name }}</td>
          <td>{{ a.email }}</td>
          <td>{{ a.age }}</td>
          <td>
            <span :class="a.active ? 'badge-success' : 'badge-danger'">
              {{ a.active ? 'Yes' : 'No' }}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-primary btn-sm" @click="openEdit(a)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(a)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" v-if="authors.length > 0">
      <button class="btn btn-secondary btn-sm" :disabled="!hasPrevious" @click="goPrevious">← Previous</button>
      <button class="btn btn-secondary btn-sm" :disabled="!hasNext" @click="goNext">Next →</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingId ? 'Edit Author' : 'New Author' }}</h3>
        <div class="field">
          <label>Name</label>
          <input v-model="editName" type="text" placeholder="Author name" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="editEmail" type="email" placeholder="author@example.com" />
        </div>
        <div class="field">
          <label>Age</label>
          <input v-model.number="editAge" type="number" min="0" placeholder="Age" />
        </div>
        <div class="field checkbox-field">
          <label>
            <input v-model="editActive" type="checkbox" />
            Active
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
  h2 { margin: 0; color: #1e293b; }
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

.loading, .empty {
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

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

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f1f5f9; }
}

.badge-success { background: #d1fae5; color: #065f46; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
.badge-danger { background: #fee2e2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }

.actions { display: flex; gap: 0.5rem; }

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

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);

  h3 { margin: 0 0 1.25rem; color: #1e293b; }

  .field {
    margin-bottom: 1rem;
    label { display: block; margin-bottom: 0.3rem; font-weight: 600; font-size: 0.9rem; color: #333; }
    input[type="text"], input[type="email"], input[type="number"] {
      width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #ced4da; border-radius: 6px; font-size: 1rem; box-sizing: border-box;
      &:focus { border-color: #2a5298; outline: none; box-shadow: 0 0 0 3px rgba(42,82,152,0.15); }
    }
  }

  .checkbox-field label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; input { width: auto; } }

  .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
}
</style>
