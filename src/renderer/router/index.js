import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/detail/:id',
      name: 'detail-page',
      component: require('@/components/Detail').default
    },
    {
      path: '/archive',
      name: 'archive',
      component: require('@/components/Archive').default
    },
    {
      path: '/report',
      name: 'report',
      component: require('@/components/Report').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
