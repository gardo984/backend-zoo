<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { fetchBooks, createBook, updateBook, deleteBook } from '../api/books'
import { fetchCategories } from '../api/categories'
import { fetchAuthors } from '../api/authors'
import type { BookResponse, BookCreate, CategoryResponse, AuthorResponse } from '../types'

const books = ref<BookResponse[]>([])
const categories = ref<CategoryResponse[]>([])
const authors = ref<AuthorResponse[]>([])
const loading = ref(false)
const showModal = ref(false)

const editName = ref('')
const editActive = ref(true)
const editDescription = ref('')
const editImage = ref('')
const editPrice = ref<number | null>(null)
const editCategoryId = ref<number | null>(null)
const editAuthorId = ref<number | null>(null)
const editingId = ref<number | null>(null)

onMounted(async () => {
  await Promise.all([loadBooks(), loadCategories(), loadAuthors()])
})

async function loadBooks() {
  loading.value = true
  try {
    books.value = await fetchBooks()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to load books.' })
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await fetchCategories()
  } catch { /* silent */ }
}

async function loadAuthors() {
  try {
    authors.value = await fetchAuthors()
  } catch { /* silent */ }
}

function openCreate() {
  editingId.value = null
  editName.value = ''
  editActive.value = true
  editDescription.value = ''
  editImage.value = ''
  editPrice.value = null
  editCategoryId.value = categories.value.length ? categories.value[0].id : null
  editAuthorId.value = authors.value.length ? authors.value[0].id : null
  showModal.value = true
}

function openEdit(b: BookResponse) {
  editingId.value = b.id
  editName.value = b.name
  editActive.value = b.active
  editDescription.value = b.description || ''
  editImage.value = b.image || ''
  editPrice.value = b.price ? Number(b.price) : null
  editCategoryId.value = b.category.id
  editAuthorId.value = b.author.id
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function handleSave() {
  if (!editName.value.trim() || editCategoryId.value === null || editAuthorId.value === null) {
    await Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Name, category, and author are required.' })
    return
  }
  const payload: BookCreate = {
    name: editName.value.trim(),
    active: editActive.value,
    description: editDescription.value || null,
    image: editImage.value || null,
    price: editPrice.value !== null ? editPrice.value : 0,
    category_id: editCategoryId.value,
    author_id: editAuthorId.value,
  }
  try {
    if (editingId.value) {
      await updateBook(editingId.value, payload)
      await Swal.fire({ icon: 'success', title: 'Updated', timer: 1500, showConfirmButton: false })
    } else {
      await createBook(payload)
      await Swal.fire({ icon: 'success', title: 'Created', timer: 1500, showConfirmButton: false })
    }
    closeModal()
    await loadBooks()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Operation failed.' })
  }
}

async function handleDelete(b: BookResponse) {
  const result = await Swal.fire({
    title: 'Delete Book?',
    text: `Are you sure you want to delete "${b.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete',
  })
  if (!result.isConfirmed) return
  try {
    await deleteBook(b.id)
    await Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false })
    await loadBooks()
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.detail || 'Failed to delete book.' })
  }
}
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>Books</h2>
      <button class="btn btn-primary" @click="openCreate">+ New Book</button>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="books.length === 0" class="empty">No books found.</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Author</th>
          <th>Price</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in books" :key="b.id">
          <td>{{ b.id }}</td>
          <td>{{ b.name }}</td>
          <td>{{ b.category.name }}</td>
          <td>{{ b.author.name }}</td>
          <td>{{ b.price !== null && b.price !== undefined ? Number(b.price).toFixed(2) : '—' }}</td>
          <td>
            <span :class="b.active ? 'badge-success' : 'badge-danger'">
              {{ b.active ? 'Yes' : 'No' }}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-primary btn-sm" @click="openEdit(b)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(b)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingId ? 'Edit Book' : 'New Book' }}</h3>
        <div class="field">
          <label>Name</label>
          <input v-model="editName" type="text" placeholder="Book title" />
        </div>
        <div class="field">
          <label>Category</label>
          <select v-model.number="editCategoryId">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>Author</label>
          <select v-model.number="editAuthorId">
            <option v-for="a in authors" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>Description</label>
          <input v-model="editDescription" type="text" placeholder="Optional description" />
        </div>
        <div class="field">
          <label>Image Path</label>
          <input v-model="editImage" type="text" placeholder="e.g. /images/book.png" />
        </div>
        <div class="field">
          <label>Price</label>
          <input v-model.number="editPrice" type="number" step="0.001" min="0" placeholder="0.000" />
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
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);

  h3 { margin: 0 0 1.25rem; color: #1e293b; }

  .field {
    margin-bottom: 1rem;
    label { display: block; margin-bottom: 0.3rem; font-weight: 600; font-size: 0.9rem; color: #333; }
    input[type="text"], input[type="number"], select {
      width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #ced4da; border-radius: 6px; font-size: 1rem; box-sizing: border-box;
      &:focus { border-color: #2a5298; outline: none; box-shadow: 0 0 0 3px rgba(42,82,152,0.15); }
    }
    select { background: #fff; cursor: pointer; }
  }

  .checkbox-field label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; input { width: auto; } }

  .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
}
</style>
