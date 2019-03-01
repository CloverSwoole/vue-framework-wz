import router from './router'
import store from './store'
import vue from 'vue'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式

// permissiom judge
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin权限 直接通过
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

/**
 * register global progress. 不鉴权向白名单
 * @type {string[]}
 */
const whiteList = ['/login', '/authredirect']
/**
 * 路由拦截器
 */
router.beforeEach((to, from, next) => {
    NProgress.start() // 开启Progress
    /**
     * 判断是否有token
     */
  if (store.getters.token) {
      /**
       * 判断是否为登录
       */
      if (to.path === '/login') {
        next({ path: '/' })
      } else {
        /**
         * 判断当前用户是否已拉取完user_info信息
         */
        if (store.getters.roles.length === 0) {
          /**
           * 拉取user_info
           */
          store.dispatch('GetInfo').then(res => {
            /**
             * 获取角色
             */
            const roles = res.data.role
            /**
             * 调用生成动态路由
             */
            store.dispatch('GenerateRoutes', { roles }).then(() => { // 生成可访问的路由表
                /**
                 * 动态添加可访问路由表
                 */
                router.addRoutes(store.getters.addRouters) //
                /**
                 * hack方法 确保addRoutes已完成
                 */
                next({ ...to })
            })

          }).catch(() => {
              /**
               * 拉取失败(调用注销)
               */
              store.dispatch('FedLogOut').then(() => {
                next({ path: '/login' })
              })
          })
        } else {
            /**
             * 获取当前路由组
             */
            store.dispatch('getNowRoutes', to);
            /**
             * 判断路由是否存在
             */
            if (hasPermission(store.getters.roles, to.meta.role)) {
              next()
            } else {
              next({ path: '/', query: { noGoBack: true }})
            }
        }
      }
  } else {
      /**
       * 判断要跳转的路由是否 在免鉴权白名单
       */
      if (whiteList.indexOf(to.path) !== -1) {
          /**
           * 直接进入
           */
          next()
      } else {
          /**
           * 否则全部重定向到登录页
           */
          next('/login') //
          /**
           * 在hash模式下 改变手动改变hash 重定向回来 不会触发afterEach 暂时hack方案 ps：history模式下无问题，可删除该行！
           */
          NProgress.done() //
      }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
