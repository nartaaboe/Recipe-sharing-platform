import http from '@/utils/http'
import { mockAPI } from '@/mocks/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL

export const registerAPI = (data) => {
    if (USE_MOCK) {
        return mockAPI.register(data)
    }
    return http.post('/users/register', data)
}

export const loginAPI = (data) => {
    if (USE_MOCK) {
        return mockAPI.login(data)
    }
    return http.post('/users/login', data)
}

export const logoutAPI = () => {
    if (USE_MOCK) {
        return mockAPI.logout()
    }
    return http.post('/users/logout')
}

export const updateNameAPI = (username) => {
    if (USE_MOCK) {
        return mockAPI.updateUsername(username)
    }
    return http.patch('/users/update-username', { username })
}

export const addFavoriteAPI = (recipeId) => {
    if (USE_MOCK) {
        return mockAPI.addFavorite(recipeId)
    }
    return http.post(`/users/favorites/${recipeId}`)
}

export const removeFavoriteAPI = (recipeId) => {
    if (USE_MOCK) {
        return mockAPI.removeFavorite(recipeId)
    }
    return http.delete(`/users/favorites/${recipeId}`)
}

export const getFavoritesAPI = () => {
    if (USE_MOCK) {
        return mockAPI.getFavorites()
    }
    return http.get('/users/favorites')
}

export const getMyRecipesAPI = () => {
    if (USE_MOCK) {
        return mockAPI.getMyRecipes()
    }
    return http.get('/users/my-recipes')
}

export const uploadAvatarAPI = (file) => {
    if (USE_MOCK) {
        return mockAPI.uploadAvatar(file)
    }
    const formData = new FormData()
    formData.append('avatar', file)
    return http.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}
