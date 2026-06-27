import api from './api'

export const mlService = {
  async getRiskScore() {
    const res = await api.get('/ml/risk-score')
    return res.data
  },

  async getRecommendations() {
    const res = await api.get('/ml/recommendations')
    return res.data
  },
  
  async verifyImage(targetId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await api.post(`/targets/${targetId}/verify-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  }
}
