// StudentsPage.jsx — the complete Student Management UI
// Features: search, paginated table, add/edit modal, delete confirm, photo upload

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import * as studentApi from '../api/studentApi'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

// ── Blank form state — reused when opening a fresh "Add" modal
const EMPTY_FORM = {
  full_name: '', email: '', phone: '',
  guardian_name: '', guardian_phone: '',
  room_id: '', admission_date: '',
}

export default function StudentsPage() {
  const { isWarden } = useAuth()
  const { showToast } = useToast()

  // ── State ────────────────────────────────────────────────────
  const [students, setStudents]     = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false)
  const [editStudent, setEditStudent] = useState(null)  // null = adding new
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  // ── Fetch students ────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await studentApi.getStudents({ search, page, limit: 15 })
      setStudents(data.data)
      setPagination(data.pagination)
    } catch (err) {
      showToast('Failed to load students', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, page])  // re-run whenever search or page changes

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // Reset to page 1 whenever search changes
  useEffect(() => { setPage(1) }, [search])

  // ── Modal helpers ─────────────────────────────────────────────
  const openAdd = () => {
    setEditStudent(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (student) => {
    setEditStudent(student)
    setForm({
      full_name:      student.full_name,
      email:          student.email,
      phone:          student.phone || '',
      guardian_name:  student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      room_id:        student.room_id || '',
      admission_date: student.admission_date?.slice(0, 10) || '', // "2024-06-01"
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditStudent(null) }

  // ── Form field change ─────────────────────────────────────────
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ── Save (create or update) ───────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editStudent) {
        await studentApi.updateStudent(editStudent.id, form)
        showToast('Student updated successfully', 'success')
      } else {
        await studentApi.createStudent(form)
        showToast('Student added successfully', 'success')
      }
      closeModal()
      fetchStudents()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await studentApi.deleteStudent(deleteTarget.id)
      showToast(`${deleteTarget.full_name} deleted`, 'success')
      setDeleteTarget(null)
      fetchStudents()
    } catch (err) {
      showToast(err.response?.data?.error || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total ?? '—'} total students
          </p>
        </div>
        {isWarden() && (
          <Button onClick={openAdd}>+ Add Student</Button>
        )}
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name, email, or student ID…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input max-w-md"
      />

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16"><Spinner size="lg" className="mx-auto" /></div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">🎓</p>
            <p>{search ? 'No students match your search.' : 'No students yet. Add one!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Student</th>
                  <th className="th">ID</th>
                  <th className="th">Room</th>
                  <th className="th">Phone</th>
                  <th className="th">Status</th>
                  {isWarden() && <th className="th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        {/* Avatar — shows photo or initials */}
                        {student.photo_url ? (
                          <img
                            src={`/${student.photo_url}`}
                            alt={student.full_name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-100
                                          text-primary-700 flex items-center
                                          justify-center text-sm font-bold flex-shrink-0">
                            {student.full_name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {student.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td font-mono text-xs text-gray-600">
                      {student.student_id}
                    </td>
                    <td className="td text-gray-600">
                      {student.room_number
                        ? `${student.room_number} (${student.room_type})`
                        : <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="td text-gray-600">{student.phone || '—'}</td>
                    <td className="td"><Badge label={student.status} /></td>
                    {isWarden() && (
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(student)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(student)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"
                    disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </Button>
            <Button variant="outline" size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editStudent ? `Edit — ${editStudent.full_name}` : 'Add New Student'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200
                            text-red-700 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name <span className="text-red-500">*</span>
              </label>
              <input name="full_name" required value={form.full_name}
                     onChange={handleChange} className="input"
                     placeholder="Ravi Kumar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input name="email" type="email" required value={form.email}
                     onChange={handleChange} className="input"
                     placeholder="ravi@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input name="phone" value={form.phone}
                     onChange={handleChange} className="input"
                     placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission date
              </label>
              <input name="admission_date" type="date" value={form.admission_date}
                     onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian name
              </label>
              <input name="guardian_name" value={form.guardian_name}
                     onChange={handleChange} className="input"
                     placeholder="Parent / Guardian" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian phone
              </label>
              <input name="guardian_phone" value={form.guardian_phone}
                     onChange={handleChange} className="input"
                     placeholder="9876543200" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editStudent ? 'Save changes' : 'Add student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm delete"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{' '}
          <strong>{deleteTarget?.full_name}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Yes, delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
