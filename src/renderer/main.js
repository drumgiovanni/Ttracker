import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import App from './App'
import router from './router'
import '@savoygu/vue-material-design-icons/src/icons'
import Icon from '@savoygu/vue-material-design-icons/src/components/Icon'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false
Vue.use(VueMaterial)
Vue.use(require('vue-moment'))
Vue.component('icon', Icon)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
