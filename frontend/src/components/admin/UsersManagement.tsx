import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users as UsersIcon, UserPlus, Edit, Trash2, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDeleteUser } from '../../hooks/query/users.query'
import { usePaginatedUsers } from '../../hooks/usePaginatedUsers'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import type { User } from '../../types'
import DataTable, { Column } from '../ui/DataTable'
import { useDataSort } from '../../hooks/useDataSort'

import SearchBar from '../ui/SearchBar'
import FilterBar from '../ui/FilterBar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import EditUserModal from './EditUserModal'
import CreateUserModal from './CreateUserModal'

export default function UsersManagement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { allData: allUsers, isLoading } = usePaginatedUsers(40, 10)
  const deleteUserMutation = useDeleteUser()

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        searchQuery === '' ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active)

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'admin' && user.is_admin) ||
        (roleFilter === 'student' && !user.is_admin)

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [allUsers, searchQuery, statusFilter, roleFilter])

  const { sortedData: sortedUsers, handleSortChange } = useDataSort(filteredUsers)

  // Auto-correct page when filtered data shrinks
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage))
    if (currentPage > maxPage) setCurrentPage(maxPage)
  }, [sortedUsers.length, itemsPerPage, currentPage])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedUsers, currentPage, itemsPerPage])

  const handleDelete = async (userId: number) => {
    if (currentUser?.id === userId) {
      toast.error(t('admin.cannotDeleteYourself'))
      return
    }

    if (confirm(t('admin.confirmDeleteUser'))) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleViewProgress = (userId: number) => {
    navigate(`/admin/users/${userId}?tab=progress`)
  }

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: t('admin.username'),
      sortable: true,
      sortType: 'string',
      render: (user) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {user.username}
        </div>
      ),
    },
    {
      key: 'name',
      header: t('admin.fullName'),
      sortable: true,
      sortKey: 'first_name',
      sortType: 'string',
      render: (user) => (
        <div className="text-gray-900 dark:text-gray-100">
          {user.first_name} {user.last_name}
        </div>
      ),
    },
    {
      key: 'role',
      header: t('admin.role'),
      render: (user) => (
        <Badge variant={user.is_admin ? 'success' : 'default'}>
          {user.is_admin ? t('admin.admin') : t('admin.student')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('admin.status'),
      render: (user) => (
        <Badge variant={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? t('admin.active') : t('admin.inactive')}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: t('admin.createdAt'),
      sortable: true,
      sortKey: 'created_at',
      sortType: 'date',
      render: (user) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewProgress(user.id)}
            title={t('admin.viewProgress')}
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingUser(user)}
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(user.id)}
            disabled={currentUser?.id === user.id}
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.usersManagement')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('admin.totalUsers', { count: filteredUsers.length })}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {t('admin.createUser')}
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        placeholder={t('admin.searchUsers')}
        onSearch={setSearchQuery}
      />

      {/* Filters */}
      <FilterBar
        filters={[
          {
            key: 'status',
            label: t('admin.status'),
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: t('admin.allStatuses'), value: 'all' },
              { label: t('admin.active'), value: 'active' },
              { label: t('admin.inactive'), value: 'inactive' },
            ],
          },
          {
            key: 'role',
            label: t('admin.role'),
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { label: t('admin.allRoles'), value: 'all' },
              { label: t('admin.admin'), value: 'admin' },
              { label: t('admin.student'), value: 'student' },
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedUsers}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
          emptyMessage={t('admin.noUsersFound')}
          onSortChange={handleSortChange}
          pagination={{
            total: sortedUsers.length,
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
            onPageChange: (newOffset) => setCurrentPage(Math.floor(newOffset / itemsPerPage) + 1),
            pageSizeOptions: [5, 10, 20],
            onPageSizeChange: (size) => { setItemsPerPage(size); setCurrentPage(1) },
          }}
        />
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}

