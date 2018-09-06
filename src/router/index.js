import Vue from 'vue'
import Router from 'vue-router'
import Ner from '@/components/Ner'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Ner',
      component: Ner
    }
  ]
})
