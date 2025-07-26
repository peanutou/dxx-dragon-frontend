import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
// 平台租户管理
const TenantList = () => import('@/views/platform/tenants/TenantList.vue')
// 租户空间模块
const Dashboard = () => import('@/views/space/dashboard/Dashboard.vue')
const FlowList = () => import('@/views/space/flows/FlowList.vue')
const FlowEditor = () => import('@/views/space/flows/FlowEditor.vue')
const FlowViewer = () => import('@/views/space/flows/FlowViewer.vue')
const FlowRunner = () => import('@/views/space/flows/FlowRunner.vue')
const TenantSettingsLayout = () => import('@/views/space/settings/TenantSettingsLayout.vue')
const TenantProfile = () => import('@/views/space/settings/TenantProfile.vue')
const TenantRoles = () => import('@/views/space/settings/TenantRoles.vue')
const TenantUsers = () => import('@/views/space/settings/TenantUsers.vue')
// Chat模块
const ChatView = () => import('@/views/space/chat/ChatView.vue')
// 文件模块
const FileList = () => import('@/views/space/files/FileList.vue')
// 错误页面
const NotFound = () => import('@/views/errors/404.vue')
const ServerError = () => import('@/views/errors/500.vue')
const Forbidden = () => import('@/views/errors/403.vue')
const Unauthorized = () => import('@/views/errors/401.vue')

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/',
        component: DashboardLayout,
        children: [
            {
                path: '',
                redirect: '/space/dashboard'
            },
            {
                path: 'platform/tenants',
                name: 'PlatformTenantList',
                component: TenantList
            },
            {
                path: 'space/dashboard',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: 'space/flows',
                name: 'FlowList',
                component: FlowList
            },
            {
                path: 'space/flows/:id/edit',
                name: 'FlowEditor',
                component: FlowEditor,
                meta: {
                    fullscreen: true,
                    showBackButton: true,
                    backButtonText: '← 返回流程列表',
                    backButtonTarget: '/space/flows'
                }
            },
            {
                path: 'space/flows/:id/view',
                name: 'FlowViewer',
                component: FlowViewer,
                meta: {
                    fullscreen: true,
                    showBackButton: true,
                    backButtonText: '← 返回流程列表',
                    backButtonTarget: '/space/flows'
                }
            },
            {
                path: 'space/flows/:id/run',
                name: 'FlowRunner',
                component: FlowRunner,
                meta: {
                    fullscreen: true,
                    showBackButton: true,
                    backButtonText: '← 返回流程列表',
                    backButtonTarget: '/space/flows'
                }
            },
            {
                path: 'space/chat',
                name: 'ChatView',
                component: ChatView,
            },
            {
                path: 'space/files',
                name: 'FileList',
                component: FileList
            },
            {
                path: 'space/settings',
                name: 'TenantSettings',
                component: TenantSettingsLayout,
                children: [
                    {
                        path: 'profile',
                        name: 'TenantProfile',
                        component: TenantProfile
                    },
                    {
                        path: 'roles',
                        name: 'TenantRoles',
                        component: TenantRoles
                    },
                    {
                        path: 'users',
                        name: 'TenantUsers',
                        component: TenantUsers
                    }
                ]
            }
        ],
        meta: { requiresAuth: true }
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: Forbidden
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: Unauthorized
    },
    {
        path: '/404',
        name: 'NotFound',
        component: NotFound
    },
    {
        path: '/500',
        name: 'ServerError',
        component: ServerError
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫：未登录自动跳转到登录页
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    if (to.meta.requiresAuth && !userStore.user) {
        next('/login')
    } else if (to.path === '/login' && userStore.user) {
        next('/space/dashboard')
    } else {
        next()
    }
})

export default router
