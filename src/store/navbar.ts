import { defineStore } from 'pinia'
import { VNode } from 'vue'

export const useNavbarStore = defineStore('navbar', {
  state: () => ({
    actions: [] as (() => VNode)[]
  }),
  actions: {
    setActions(actions: (() => VNode)[]) {
      this.actions = actions
    },
    clearActions() {
      this.actions = []
    }
  }
})
