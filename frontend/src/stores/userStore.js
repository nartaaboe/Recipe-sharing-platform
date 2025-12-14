import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref({
        token: null,
        username: '',
        email: '',
        avatar: ''
    })

    // Getters
    const isLoggedIn = computed(() => !!userInfo.value.token)
    
    const userName = computed(() => userInfo.value.username || 'Guest')
    
    const userEmail = computed(() => userInfo.value.email || '')
    
    const userAvatar = computed(() => userInfo.value.avatar || '')

    const setUserInfo = (data) => {
        userInfo.value = data
        localStorage.setItem('userInfo', JSON.stringify(data))
    }

    const setToken = (token) => {
        userInfo.value.token = token
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    const setAvatar = (url) => {
        userInfo.value.avatar = url
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    const setUsername = (name) => {
        userInfo.value.username = name
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    const logout = () => {
        userInfo.value = { token: null, username: '', email: '', avatar: '' }
        localStorage.removeItem('userInfo')
    }

    // 初始化（用于刷新页面保持登录状态）
    const loadLocalStorage = () => {
        const saved = localStorage.getItem('userInfo')
        if (saved) {
            userInfo.value = JSON.parse(saved)
        }
    }

    return { 
        userInfo, 
        isLoggedIn,
        userName,
        userEmail,
        userAvatar,
        setUserInfo, 
        setToken, 
        logout, 
        loadLocalStorage, 
        setAvatar, 
        setUsername 
    }
})
