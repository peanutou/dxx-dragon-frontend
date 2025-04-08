// src/store/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as null | { 
            email: string; 
            token?: string;
            roles?: string[];
            permissions?: string[];
        },
        decodedToken: null as null | Record<string, any>
    }),

    actions: {
        setUser(user: any) {
            this.user = user
            if (user?.token) {
                this.decodedToken = this.decodeToken(user.token)
            }
        },
        logout() {
            this.user = null
            this.decodedToken = null
        },
        decodeToken(token: string) {
            try {
                const payload = token.split('.')[1]
                const decodedPayload = atob(payload)
                return JSON.parse(decodedPayload)
            } catch (error) {
                console.error('Failed to decode token:', error)
                return null
            }
        }
    },

    persist: true // 可选：保持登录状态，需使用 pinia-plugin-persistedstate
})