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
                path: 'space/settings',
                name: 'TenantSettings',
                component: () => import('@/views/space/settings/TenantSettingsLayout.vue'),
                children: [
                    {
                        path: 'profile',
                        name: 'TenantProfile',
                        component: () => import('@/views/space/settings/TenantProfile.vue')
                    },
                    {
                        path: 'roles',
                        name: 'TenantRoles',
                        component: () => import('@/views/space/settings/TenantRoles.vue')
                    },
                    {
                        path: 'users',
                        name: 'TenantUsers',
                        component: () => import('@/views/space/settings/TenantUsers.vue')
                    }
                ]
            }
        ],
        meta: { requiresAuth: true }
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('@/views/errors/403.vue')
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: () => import('@/views/errors/401.vue')
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/views/errors/404.vue')
    },
    {
        path: '/500',
        name: 'ServerError',
        component: () => import('@/views/errors/500.vue')
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
