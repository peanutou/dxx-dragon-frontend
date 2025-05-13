import { useUserStore } from '@/store/user'
import router from '@/router/index'

export async function customFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const token = useUserStore().token
    const tenantSlug = window.location.hostname.split('.')[0]

    let baseHeaders: Record<string, string> = {}
    if (init.headers instanceof Headers) {
        baseHeaders = {}
        init.headers.forEach((value, key) => {
            baseHeaders[key] = value
        })
    } else if (init.headers && typeof init.headers === 'object') {
        baseHeaders = Object.fromEntries(Object.entries(init.headers).map(([k, v]) => [k, String(v)]))
    }

    const headers: Record<string, string> = {
        ...baseHeaders,
        'Content-Type': 'application/json'
    }

    if (token) headers.Authorization = `Bearer ${token}`
    if (tenantSlug) headers['X-Tenant-Slug'] = tenantSlug

    let url = typeof input === 'string' ? input : input.url
    if (url.startsWith('/')) {
        url = import.meta.env.VITE_API_BASE_URL + url
    }

    try {
        const response = await fetch(url, {
            ...init,
            headers
        })

        if (!response.ok) {
            const status = response.status
            const currentPath = window.location.pathname
            if (status === 401) {
                const userStore = useUserStore()
                userStore.logout()
                console.log('Token expired or invalid, redirecting to login page.')
                router.push({ path: '/login', query: { redirect: currentPath } })
            } else if (status === 403) {
                router.push('/403')
            } else if (status === 404) {
                router.push('/404')
            }
        }

        return response
    } catch (error) {
        console.error('Fetch error:', error)
        throw error
    }
}
