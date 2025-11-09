'use client'

import { useState, useCallback, useMemo } from 'react'
import { UserItem } from '../contexts/UserDataContext'
import { useFilterUsers } from './useFilterUsers'

export interface FilterState {
  search: string
  roles: string[]      // Multi-select: array of roles
  statuses: string[]   // Multi-select: array of statuses
  // Legacy single-select support (deprecated)
  role?: string | null
  status?: string | null
}

export interface FilterStats {
  totalCount: number
  filteredCount: number
  isFiltered: boolean
}

export function useFilterState(users: UserItem[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    roles: [],
    statuses: []
  })

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, [])

  // Memoized filtered results using existing useFilterUsers hook
  const filteredUsers = useMemo(() => {
    const options = {
      search: filters.search,
      role: filters.role || undefined,
      status: filters.status || undefined
    }
    
    // Filter both ways - through hook and custom logic for phone field
    let result = useFilterUsers(users, options, {
      searchFields: ['name', 'email', 'phone'],
      caseInsensitive: true,
      sortByDate: true,
      serverSide: false
    }) as UserItem[]
    
    return result
  }, [users, filters])

  const hasActiveFilters = !!(
    filters.search || 
    filters.role || 
    filters.status
  )

  const clearFilters = useCallback(() => {
    setFilters({ search: '', role: null, status: null })
  }, [])

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const stats: FilterStats = {
    totalCount: users.length,
    filteredCount: filteredUsers.length,
    isFiltered: hasActiveFilters
  }

  return {
    filters,
    setFilters,
    updateFilter,
    filteredUsers,
    hasActiveFilters,
    clearFilters,
    stats
  }
}
