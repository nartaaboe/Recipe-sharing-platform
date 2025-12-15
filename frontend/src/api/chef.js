import http from '@/utils/http'
import { mockAPI } from '@/mocks/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL

export const getAllChefsAPI = (search = '') => {
    if (USE_MOCK) {
        return mockAPI.getAllChefs(search)
    }
    return http.get(`/chefs${search ? `?search=${encodeURIComponent(search)}` : ''}`)
}

export const getChefByRecipeAPI = (recipeId) => {
    if (USE_MOCK) {
        return mockAPI.getChefByRecipe(recipeId)
    }
    return http.get(`/chefs/recipe/${recipeId}`)
}

export const getChefProfileAPI = (chefId) => {
    if (USE_MOCK) {
        return mockAPI.getChefProfile(chefId)
    }
    return http.get(`/chefs/${chefId}`)
}

export const followChefAPI = (chefId) => {
    if (USE_MOCK) {
        return mockAPI.followChef(chefId)
    }
    return http.post(`/chefs/${chefId}/follow`)
}

export const unfollowChefAPI = (chefId) => {
    if (USE_MOCK) {
        return mockAPI.unfollowChef(chefId)
    }
    return http.delete(`/chefs/${chefId}/follow`)
}

export const getFollowingAPI = () => {
    if (USE_MOCK) {
        return mockAPI.getFollowing()
    }
    return http.get('/chefs/following')
}

export const isFollowingAPI = (chefId) => {
    if (USE_MOCK) {
        return mockAPI.isFollowing(chefId)
    }
    return http.get(`/chefs/${chefId}/following`)
}

export const getChefsByRecipeAPI = (recipeId) => {
    if (USE_MOCK) {
        return mockAPI.getChefsByRecipe(recipeId)
    }
    return http.get(`/chefs/by-recipe/${recipeId}`)
}
