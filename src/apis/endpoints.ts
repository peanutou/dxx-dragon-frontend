import { config } from "process"

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
        nodeTypes: '/space/flows/node-types',
        get: (id: string) => `/space/flows/${id}`,
        update: (id: string) => `/space/flows/${id}`,
        delete: (id: string) => `/space/flows/${id}`,
        edit: (id: string) => `/space/flows/${id}/edit`,
        publish: (id: string) => `/space/flows/${id}/publish`,
        config: (id: string) => `/space/flows/${id}/config`,
        run: (id: string) => `/space/flows/${id}/run`,
        runDebug: (id: string) => `/space/flows/${id}/run-debug`,
        runTest: (id: string) => `/space/flows/${id}/test`,
        testNode: (id: string) => `/space/flows/${id}/test-node`,
    },
    files: {
        upload: '/space/files/upload',
        getMetadata: (fileId: string) => `/space/files/${fileId}`,
        delete: (fileId: string) => `/space/files/${fileId}`,
        list: '/space/files',
        downloadStream: (fileId: string) => `/space/files/${fileId}/download`,
        downloadBase64: (fileId: string) => `/space/files/${fileId}/download/base64`,
    },
}