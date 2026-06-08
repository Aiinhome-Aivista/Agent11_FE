import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── API helpers ──────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email, password) => api.post('/auth/login', new URLSearchParams({ username: email, password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const socialAPI = {
  connect: (data) => api.post('/social/connect', data),
  refresh: (platform) => api.post(`/social/refresh/${platform}`),
  myAccounts: () => api.get('/social/me'),
}

export const influencersAPI = {
  list: (params) => api.get('/influencers', { params }),
  get: (id) => api.get(`/influencers/${id}`),
  updateProfile: (id, data) => api.patch(`/influencers/${id}/profile`, null, { params: data }),
}

export const campaignsAPI = {
  list: () => api.get('/campaigns'),
  create: (data) => api.post('/campaigns', data),
  setStatus: (id, status) => api.patch(`/campaigns/${id}/status`, null, { params: { status } }),
}

export const missionsAPI = {
  list: () => api.get('/missions'),
  listAssignments: () => api.get('/missions/assignments'),
  create: (data) => api.post('/missions', data),
  assign: (id, influencer_id) => api.post(`/missions/${id}/assign`, { influencer_id }),
  // `data` may contain either `submission_url` (single platform) or
  // `submission_urls` ({ instagram: "...", youtube: "..." }) for multi-platform.
  submit: (id, data) => api.post(`/missions/${id}/submit`, data),
  approve: (assignmentId) => api.post(`/missions/${assignmentId}/approve`),
  // Optional `platform` selects which submitted URL to analyse for multi-
  // platform missions.
  insights: (assignmentId, platform) =>
    api.get(`/missions/${assignmentId}/insights`, { params: platform ? { platform } : {} }),
}

export const agentsAPI = {
  recommend: (campaignId) => api.get(`/agents/recommend/${campaignId}`),
  fraud: (influencerId) => api.get(`/agents/fraud/${influencerId}`),
  roi: (campaignId) => api.get('/agents/roi', { params: { campaign_id: campaignId } }),
}

export const chatAPI = {
  send: (message, history, sessionId) => api.post('/chat', { message, conversation_history: history, session_id: sessionId }),
  history: () => api.get('/chat/history'),
}

export const kycAPI = {
  // Upload now requires the influencer's account password — backend uses it
  // (with a per-user salt) to derive an encryption key and store the file
  // as ciphertext at rest.
  upload: (docType, file, password) => {
    const form = new FormData()
    form.append('file', file)
    form.append('password', password)
    return api.post(`/kyc/upload?doc_type=${docType}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  list: () => api.get('/kyc'),
  adminAll: (status) => api.get('/kyc/admin/all', { params: status ? { status } : {} }),
  approve: (docId) => api.post(`/kyc/${docId}/approve`),
  reject: (docId, reason) => api.post(`/kyc/${docId}/reject`, { reason }),
  stats: () => api.get('/kyc/admin/stats'),
  // Admin-only: returns the decrypted document as { mime_type, content_base64 }
  // after verifying the influencer's password.
  view: (docId, password) => api.post(`/kyc/${docId}/view`, { password }),
}

export const payoutsAPI = {
  list: () => api.get('/payouts'),
  process: (id, txnId) => api.post(`/payouts/${id}/process`, null, { params: { transaction_id: txnId } }),
}

export const ragAPI = {
  addDoc: (data) => api.post('/rag/documents', data),
  uploadFile: (title, category, file, campaignId) => {
    const form = new FormData()
    form.append('file', file)
    const params = new URLSearchParams({ title, category })
    if (campaignId) params.append('campaign_id', campaignId)
    return api.post(`/rag/upload?${params}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  stats: () => api.get('/rag/stats'),
  search: (query) => api.post('/rag/search', null, { params: { query } }),
  listDocs: () => api.get('/rag/documents'),
  deleteDoc: (docId) => api.delete(`/rag/documents/${docId}`),
}

export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
}


