import http from '@/utils/http'
import { mockAPI } from '@/mocks/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL

export const createRecipeAPI = (formData) => {
    if (USE_MOCK) {
        return mockAPI.createRecipe(formData)
    }
    return http.post('/recipes', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const getRecipeAPI = (id) => {
    if (USE_MOCK) {
        return mockAPI.getRecipe(id)
    }
    return http.get(`/recipes/${id}`)
}

export const getLatestRecipesAPI = (page = 1, pageSize = 10) => {
    if (USE_MOCK) {
        return mockAPI.getLatestRecipes(page, pageSize)
    }
    return http.get(`/recipes/latest?page=${page}&pageSize=${pageSize}`)
}

export const getPopularRecipesAPI = (limit = 10) => {
    if (USE_MOCK) {
        return mockAPI.getPopularRecipes(limit)
    }
    return http.get(`/recipes/popular?limit=${limit}`)
}

export const updateRecipeAPI = (id, data) => {
    if (USE_MOCK) {
        return mockAPI.updateRecipe(id, data)
    }
    return http.put(`/recipes/${id}`, data)
}

export const deleteRecipeAPI = (id) => {
    if (USE_MOCK) {
        return mockAPI.deleteRecipe(id)
    }
    return http.delete(`/recipes/${id}`)
}

export const toggleFavoriteAPI = (id) => {
    if (USE_MOCK) {
        return mockAPI.toggleFavorite(id)
    }
    return http.post(`/recipes/${id}/favorite`)
}

export const getAllRecipesAPI = (page = 1, pageSize = 20, search = '', author = '') => {
    if (USE_MOCK) {
        return mockAPI.getAllRecipes(page, pageSize, search, author)
    }
    // 拼接 URL
    let url = `/recipes/all?page=${page}&pageSize=${pageSize}`;

    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }

    // 如果有 author，拼接到 URL 上
    if (author) {
        url += `&author=${author}`;
    }

    return http.get(url);
}
