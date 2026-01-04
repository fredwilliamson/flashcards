import type { User, UserCreate, UserPatch } from '../types'
import api from './api'

export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>('/admin/users')
  return res.data
}

export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get<User>(`/users/${id}`)
  return res.data
}

export const createUser = async (data: UserCreate): Promise<User> => {
  const res = await api.post<User>('/admin/users', data)
  return res.data
}

export const patchUser = async (id: number, data: UserPatch): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}`, data)
  return res.data
}

export const deleteUser = async (id: number): Promise<void> => {
  const res = await api.delete(`/users/${id}`)
  return res.data
}

