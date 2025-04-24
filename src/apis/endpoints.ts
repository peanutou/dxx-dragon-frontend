export const PlatformTenantAPI = {
    list: '/platform/tenants',
    create: '/platform/tenants',
    update: (id: string) => `/platform/tenants/${id}`,
    delete: (id: string) => `/platform/tenants/${id}`,
    // 注意：编辑入口已废除
}


 // 用户认证 API 路径
export const AuthAPI = {
    login: '/auth/login',
    register: '/auth/register',
}


 // 租户空间 API 路径
export const TenantSpaceAPI = {
    dashboard: '/space/dashboard',
    tenants: {
      get: (id: string) => `/space/tenants/${id}`,
      permissions: (id: string) => `/space/tenants/${id}/permissions`
    },
    users: {
        list: '/space/users',
        create: '/space/users',
        update: (id: string) => `/space/users/${id}`,
        delete: (id: string) => `/space/users/${id}`,
        details: (id: string) => `/space/users/${id}/details`,  // 可选的详情接口
    },
    roles: {
        list: '/space/roles',
        create: '/space/roles',
        update: (id: string) => `/space/roles/${id}`,
        delete: (id: string) => `/space/roles/${id}`,
        initialize: '/space/roles/initialize',
    },
    flows: {
        list: '/space/flows',
        create: '/space/flows',
        update: (id: string) => `/space/flows/${id}`,
        delete: (id: string) => `/space/flows/${id}`,
        edit: (id: string) => `/space/flows/${id}/edit`,
        run: (id: string) => `/space/flows/${id}/run`,
    },
}