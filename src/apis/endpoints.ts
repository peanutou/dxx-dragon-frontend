import { config } from "process"
import { LiteralType } from "typescript"

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
        clientKey: (id: string) => `/space/users/${id}/client-key`, // 获取用户客户端密钥
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
        nodeDefaults: '/space/flows/node-defaults',
        get: (id: string) => `/space/flows/${id}`,
        update: (id: string) => `/space/flows/${id}`,
        delete: (id: string) => `/space/flows/${id}`,
        edit: (id: string) => `/space/flows/${id}/edit`,
        publish: (id: string) => `/space/flows/${id}/publish`,
        config: (id: string) => `/space/flows/${id}/config`,
        runs: (id: string, page: number = 1, size: number = 10, sort_by: string = 'created_at', order: string = 'desc', total_count: boolean = true) => `/space/flows/${id}/runs?page=${page}&size=${size}&sort_by=${sort_by}&order=${order}&total_count=${total_count}`,
        runResult: (id: string, runId: string) => `/space/flows/${id}/runs/${runId}`,
        run: (id: string) => `/space/flows/${id}/run`,
        runTest: (id: string) => `/space/flows/${id}/test`,
        testNode: (id: string) => `/space/flows/${id}/test-node`,
        refreshClientKey: (id: string) => `/space/flows/${id}/refresh-client-key`,
        endpoint: (id: string) => `/space/flows/${id}/endpoint`,
        openapi: (id: string, mode: 'json' | 'yaml') => `/space/flows/${id}/openapi?mode=${mode}`,
        functionCall: (id: string) => `/space/flows/${id}/function-call`,
    },
    files: {
        upload: '/space/files/upload',
        getMetadata: (fileId: string) => `/space/files/${fileId}`,
        delete: (fileId: string) => `/space/files/${fileId}`,
        list: '/space/files',
        downloadStream: (fileId: string) => `/space/files/${fileId}/download`,
        downloadBase64: (fileId: string) => `/space/files/${fileId}/download/base64`,
    },
    chat: {
        send: '/space/chat',
        stream: '/space/chat/stream'
    },
}