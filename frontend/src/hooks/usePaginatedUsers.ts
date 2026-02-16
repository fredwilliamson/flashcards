import { usePaginatedData } from './usePaginatedData'
import { getAllUsers } from '../services/user.api'
import type { User } from '../types'

export function usePaginatedUsers(backendChunkSize = 40, frontendPageSize = 10) {
  return usePaginatedData<User>({
    fetchFn: getAllUsers,
    backendChunkSize,
    frontendPageSize,
  })
}
