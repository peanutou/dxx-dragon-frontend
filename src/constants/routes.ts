export const ROUTE = {
    PLATFORM: {
        TENANTS: '/platform/tenants',
        TENANT_PROFILE: (id: string) => `/platform/tenants/${id}`
    },
    SPACE: {
        DASHBOARD: '/space/dashboard',
        USERS: '/space/settings/users',
        ROLES: '/space/settings/roles',
        PROFILE: '/space/settings/profile',
        FLOWS: {
            LIST: '/space/flows',
            EDIT: (id: string) => `/space/flows/${id}/edit`,
            RUN: (id: string) => `/space/flows/${id}/run`,
            CREATE: '/space/flows',
            UPDATE: (id: string) => `/space/flows/${id}`,
            DELETE: (id: string) => `/space/flows/${id}`,
            CONFIG: (id: string) => `/space/flows/${id}/config`,
            PUBLISH: (id: string) => `/space/flows/${id}/publish`,
            RUN_DEBUG: (id: string) => `/space/flows/${id}/run-debug`,
            NODE_TYPES: '/space/flows/node-types',
            DETAIL: (id: string) => `/space/flows/${id}`
        }
    }
}
