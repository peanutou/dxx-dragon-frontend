import axios from 'axios'
import { useUserStore } from '@/store/user'
import router from '@/router/index'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

instance.interceptors.request.use((config) => {
    const token = useUserStore().token
    const tenantSlug = window.location.hostname.split('.')[0]  // 从子域名提取租户标识
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug  // 👈 添加租户标识
    return config
})

instance.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status
        const currentPath = window.location.pathname
        if (status === 401) {
            const userStore = useUserStore();
            userStore.logout()
            console.log('Token expired or invalid, redirecting to login page.')
            router.push({ path: '/login', query: { redirect: currentPath } })
        } else if (status === 403) {
            router.push('/403')
        } else if (status === 404) {
            router.push('/404')
        } 

        return Promise.reject(error)
    }
)

export default instance