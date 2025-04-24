import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token_type: null as string | null,
        token: null as string | null,
        // 这里的 user 结构可以根据实际需要进行调整
        user: null as null | { 
            tenant_id: string | null;
            user_id: string | null;
            email: string | null;
            roles: string[];
            tenants: string[];
            role_permissions: Record<string, string[]>;
            impersonator: string | null;
            account_type: 'user' | 'system';
            client_id: string | null;
            is_active: boolean;
        },
        decodedToken: null as null | Record<string, any>
    }),

    getters: {
        currentTenantId: (state) => state.user?.tenant_id || state.user?.tenants?.[0] || ''
    },

    actions: {
        setUser(response: any) {
            const rawUser = response.user
            this.user = {
                ...rawUser,
                token: response.token
            }
            this.token_type = response.token_type
            this.token = response.token
            if (response?.token) {
                this.decodedToken = this.decodeToken(response.token)
            }
        },
        logout() {
            this.user = null
            this.token = null
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