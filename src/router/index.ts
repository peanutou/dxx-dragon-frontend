import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import UserList from '@/views/users/UserList.vue'
import RoleList from '@/views/roles/RoleList.vue'
import TenantList from '@/views/tenants/TenantList.vue'
import FlowList from '@/views/flows/FlowList.vue'
import FlowEditor from '@/views/flows/FlowEditor.vue'
import FlowRunner from '@/views/flows/FlowRunner.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/',
        component: DashboardLayout,
        children: [
            {
                path: '',
                redirect: '/dashboard'
            },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: 'tenants',
                name: 'TenantList',
                component: TenantList
            },
            {
                path: 'users',
                name: 'UserList',
                component: UserList
            },
            {
                path: 'roles',
                name: 'RoleList',
                component: RoleList
            },
            {
                path: 'flows',
                name: 'FlowList', 
                component: FlowList
            },
            {
                path: 'flows/:id/edit',
                name: 'FlowEditor',
                component: FlowEditor,
                meta: {
                    fullscreen: true,
                    showBackButton: true,
                    backButtonText: '← 返回流程列表',
                    backButtonTarget: '/flows'
                }
            },
            {
                path: 'flows/:id/run',
                name: 'FlowRunner',
                component: FlowRunner,
                meta: {
                    fullscreen: true,
                    showBackButton: true,
                    backButtonText: '← 返回流程列表',
                    backButtonTarget: '/flows'
                }
            }
        ],
        meta: { requiresAuth: true }
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
        next('/dashboard')
    } else {
        next()
    }
})

export default router
