import { defineStore } from 'pinia'

const useModalStore = defineStore('modal', {
  state: () => ({
    openModal: false,
  }),
  actions: {
    toggleModal() {
      this.openModal = !this.openModal
    },
  },
})

export default useModalStore