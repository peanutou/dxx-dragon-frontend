// src/utils/axios.ts

import axios from 'axios'
import { useUserStore } from '@/store/user'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

instance.interceptors.request.use((config) => {
    const token = useUserStore().user?.token
    const tenantSlug = window.location.hostname.split('.')[0]  // 从子域名提取租户标识
    if (token) config.headers.Authorization = `Bearer ${token}`
    if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug  // 👈 添加租户标识
    return config
})

export default instance