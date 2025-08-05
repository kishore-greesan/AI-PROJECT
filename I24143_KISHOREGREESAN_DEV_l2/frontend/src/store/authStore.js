import { create } from 'zustand'
import { persist } from 'zustand/middleware'

console.log('Creating Zustand store...')

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: (userData, token, refreshToken) => {
        console.log('Login called with:', { userData, token: token ? 'present' : 'missing' })
        set({
          user: userData,
          token,
          refreshToken,
          isAuthenticated: true
        })
        console.log('Auth state updated - isAuthenticated set to true')
      },
      
      logout: () => {
        console.log('Logout called')
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        })
      },
      
      updateUser: (userData) => set({ user: userData }),
      
      updateToken: (token) => set({ token }),
      
      updateRefreshToken: (refreshToken) => set({ refreshToken }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Zustand store rehydrated:', state)
      },
    }
  )
)

console.log('Zustand store created successfully')

export default useAuthStore 