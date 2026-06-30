<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import type { CategoryResponse } from '../types'

const categories = ref<CategoryResponse[]>([])
const loading = ref(false)

const searchTerm = ref('')
const statusFilter = ref<'all' | 'true' | 'false'>('all')
const offset = ref(0)
const ITEMS_PER_PAGE = 20

const hasPrevious = computed(() => offset.value > 0)
const hasNext = computed(() => categories.value.length === ITEMS_PER_PAGE)

function buildParams() {
  const params: Record<string, any> = { offset: offset.value }
  if (searchTerm.value) params.search = searchTerm.value
  if (statusFilter.value !== 'all') params.status = statusFilter.value === 'true'
  return params
}

async function handleSearch() {
  offset.value = 0
  await loadCategories()
}

function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleSearch()
}

async function handleStatusChange() {
  offset.value = 0
  await loadCategories()
}

async function goNext() {
  offset.value += ITEMS_PER_PAGE
  await loadCategories()
}

async function goPrevious() {
  offset.value = Math.max(0, offset.value - ITEMS_PER_PAGE)
  await loadCategories()
}
const showModal = ref(false)
const editName = ref('')
const editActive = ref(true)
const editingId = ref<number | null>(null)

onMounted(() => loadCategories())

async function loadCategories() {
  loading.value = true
  try {
    categories.value = await fetchCategories(buildParams())
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to load categories.' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  editName.value = ''
  editActive.value = true
  showModal.value = true
}

function openEdit(cat: CategoryResponse) {
  editingId.value = cat.id
  editName.value = cat.name
  editActive.value = cat.active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function handleSave() {
  if (!editName.value.trim()) {
    await Swal.fire({ icon: 'warning', title: 'Missing name', text: 'Category name is required.' })
    return
  }
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, { name: editName.value.trim(), active: editActive.value })
      await Swal.fire({ icon: 'success', title: 'Updated', timer: 1500, showConfirmButton: false })
    } else {
      await createCategory({ name: editName.value.trim(), active: editActive.value })
      await Swal.fire({ icon: 'success', title: 'Created', timer: 1500, showConfirmButton: false })
    }
    closeModal()
    await loadCategories()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Operation failed.' })
  }
}

async function handleDelete(cat: CategoryResponse) {
  const result = await Swal.fire({
    title: 'Delete Category?',
    text: `Are you sure you want to delete "${cat.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete',
  })
  if (!result.isConfirmed) return
  try {
    await deleteCategory(cat.id)
    await Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false })
    await loadCategories()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to delete category.' })
  }
}
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>Categories</h2>
      <button class="btn btn-primary" @click="openCreate">+ New Category</button>
    </div>

    <!-- Search + Status Filter -->
    <div class="search-bar">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by name…"
        class="search-input"
        @keydown="handleSearchKeydown"
      />
      <button class="btn btn-primary" @click="handleSearch">Search</button>
    </div>

    <div class="filter-row">
      <select v-model="statusFilter" class="status-select" @change="handleStatusChange">
        <option value="all">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <div class="records-info">
      Showing {{ offset + 1 }}–{{ offset + categories.length }}
      <span v-if="!hasNext"> (last page)</span>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="categories.length === 0" class="empty">
      No categories found.
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id">
          <td>{{ cat.id }}</td>
          <td>{{ cat.name }}</td>
          <td>
            <span :class="cat.active ? 'badge-success' : 'badge-danger'">
              {{ cat.active ? 'Yes' : 'No' }}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-primary btn-sm" @click="openEdit(cat)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(cat)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" v-if="categories.length > 0">
      <button class="btn btn-secondary btn-sm" :disabled="!hasPrevious" @click="goPrevious">← Previous</button>
      <button class="btn btn-secondary btn-sm" :disabled="!hasNext" @click="goNext">Next →</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingId ? 'Edit Category' : 'New Category' }}</h3>
        <div class="field">
          <label>Name</label>
          <input v-model="editName" type="text" placeholder="Category name" />
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

.badge-success {
  background: #d1fae5; color: #065f46; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;
}

.badge-danger {
  background: #fee2e2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;
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
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;
}

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
    input[type="text"] {
      width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #ced4da; border-radius: 6px; font-size: 1rem; box-sizing: border-box;
      &:focus { border-color: #2a5298; outline: none; box-shadow: 0 0 0 3px rgba(42,82,152,0.15); }
    }
  }

  .checkbox-field label {
    display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
    input { width: auto; }
  }

  .modal-actions {
    display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;
  }
}
</style>
