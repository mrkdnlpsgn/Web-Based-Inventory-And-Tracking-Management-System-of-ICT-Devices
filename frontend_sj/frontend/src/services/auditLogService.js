import api from './api'

export const getAuditLogs = (search = '') => search.trim()
  ? api.get('/audit-logs', { params: { search: search.trim() } })
  : api.get('/audit-logs')
