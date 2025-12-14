import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with empty user info', () => {
    const store = useUserStore()
    
    expect(store.userInfo.token).toBeNull()
    expect(store.userInfo.username).toBe('')
    expect(store.userInfo.email).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('isLoggedIn getter returns false when no token', () => {
    const store = useUserStore()
    
    expect(store.isLoggedIn).toBe(false)
  })

  it('isLoggedIn getter returns true when token exists', () => {
    const store = useUserStore()
    store.setToken('test-token')
    
    expect(store.isLoggedIn).toBe(true)
  })

  it('userName getter returns username', () => {
    const store = useUserStore()
    store.setUserInfo({
      token: 'test-token',
      username: 'TestUser',
      email: 'test@example.com',
      avatar: ''
    })
    
    expect(store.userName).toBe('TestUser')
  })

  it('userName getter returns Guest when no username', () => {
    const store = useUserStore()
    
    expect(store.userName).toBe('Guest')
  })

  it('setUserInfo updates user info and localStorage', () => {
    const store = useUserStore()
    const userData = {
      token: 'test-token',
      username: 'TestUser',
      email: 'test@example.com',
      avatar: '/avatar.jpg'
    }
    
    store.setUserInfo(userData)
    
    expect(store.userInfo).toEqual(userData)
    expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(userData))
  })

  it('setToken updates token', () => {
    const store = useUserStore()
    store.setToken('new-token')
    
    expect(store.userInfo.token).toBe('new-token')
  })

  it('logout clears user info and localStorage', () => {
    const store = useUserStore()
    store.setUserInfo({
      token: 'test-token',
      username: 'TestUser',
      email: 'test@example.com',
      avatar: ''
    })
    
    store.logout()
    
    expect(store.userInfo.token).toBeNull()
    expect(store.userInfo.username).toBe('')
    expect(localStorage.getItem('userInfo')).toBeNull()
  })

  it('loadLocalStorage restores user info from localStorage', () => {
    const userData = {
      token: 'saved-token',
      username: 'SavedUser',
      email: 'saved@example.com',
      avatar: ''
    }
    localStorage.setItem('userInfo', JSON.stringify(userData))
    
    const store = useUserStore()
    store.loadLocalStorage()
    
    expect(store.userInfo).toEqual(userData)
  })
})

