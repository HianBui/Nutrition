import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const analyzeFood = async (imageFile) => {
  const formData = new FormData()
  formData.append('file', imageFile)
  const res = await api.post('/analyze-food', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const generateMealPlan = async (payload) => {
  const res = await api.post('/meal-plan', payload)
  return res.data
}

export const analyzeHealth = async (payload) => {
  const res = await api.post('/health-analysis', payload)
  return res.data
}

export const suggestRecipes = async (payload) => {
  const res = await api.post('/suggest-recipes', payload)
  return res.data
}
