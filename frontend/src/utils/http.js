import axios from 'axios'
import { useUserStore } from '../stores/userStore'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const httpInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true
})

let isRefreshing = false // 是否正在刷新 Token 的标记
let failedQueue = [] // 存储因为等待 Token 刷新而挂起的请求

// 处理队列中的请求
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 请求拦截器
httpInstance.interceptors.request.use(config => {
  const userStore = useUserStore()
  const token = userStore.userInfo?.token

  // 如果有 token，注入到 header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, e => Promise.reject(e))

// 响应拦截器
httpInstance.interceptors.response.use(
  res => res.data,
  async e => {
    const originalRequest = e.config
    const userStore = useUserStore()

    // 如果响应存在，且状态码是 401 (未授权)
    if (e.response?.status === 401 && !originalRequest._retry) {

      // 如果报错的接口本身就是 'refresh-token'，说明刷新也失败了（Cookie过期）
      // 这时必须强制登出，避免死循环
      if (originalRequest.url.includes('/users/refresh-token')) {
        userStore.logout()
        router.push('/login')
        return Promise.reject(e)
      }

      // 如果正在刷新中，将当前请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(httpInstance(originalRequest))
            },
            reject: (err) => {
              reject(err)
            }
          })
        })
      }

      originalRequest._retry = true // 标记该请求已重试过
      isRefreshing = true

      try {
        // 调用刷新 Token 接口
        // 注意：这里直接用 axios 原生实例，避免走拦截器逻辑
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/users/refresh-token`, {
          withCredentials: true // 必须带上 Cookie
        })

        // 1. 拿到新 Token，存入 Pinia
        const newToken = data.token
        userStore.setToken(newToken)

        // 2. 修改原请求的 Header
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // 3. 处理队列中的其他请求
        processQueue(null, newToken)

        // 4. 重试当前请求
        isRefreshing = false
        return httpInstance(originalRequest)

      } catch (refreshErr) {
        // 刷新失败（Refresh Token 过期或无效）
        processQueue(refreshErr, null)
        isRefreshing = false
        userStore.logout()
        router.push('/login')
        return Promise.reject(refreshErr)
      }
    }

    // 处理其他错误
    // 可以在这里加统一的错误提示，例如 ElMessage
    return Promise.reject(e)
  }
)

export default httpInstance