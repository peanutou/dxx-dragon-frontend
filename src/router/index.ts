import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

// 平台租户管理
import TenantList from '@/views/platform/tenants/TenantList.vue'

// 租户空间模块
import Dashboard from '@/views/space/dashboard/Dashboard.vue'
import FlowList from '@/views/space/flows/FlowList.vue'
import FlowEditor from '@/views/space/flows/FlowEditor.vue'
import FlowRunner from '@/views/space/flows/FlowRunner.vue'
import TenantSettingsLayout from '@/views/space/settings/TenantSettingsLayout.vue'
import TenantProfile from '@/views/space/settings/TenantProfile.vue'
import TenantRoles from '@/views/space/settings/TenantRoles.vue'
import TenantUsers from '@/views/space/settings/TenantUsers.vue'

// Chat模块
import ChatView from '@/views/space/chat/ChatView.vue'

// 文件模块
import FileList from '@/views/space/files/FileList.vue'

// 错误页面
import NotFound from '@/views/errors/404.vue'
import ServerError from '@/views/errors/500.vue'
import Forbidden from '@/views/errors/403.vue'
import Unauthorized from '@/views/errors/401.vue'

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
