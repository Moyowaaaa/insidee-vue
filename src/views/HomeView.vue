<script setup lang="ts">
import CardGallery from '@/components/CardGallery.vue'
</script>

<template>
  <section class="home">
    <CardGallery />
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/abstracts' as *;

.home {
  background-color: white;
  height: 100vh;
  width: 100%;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;

  @include respond-below('md') {
    height: auto;
    min-height: 100vh;
    align-items: flex-start;
    padding: 11.5rem 0 4rem;
  }
}
</style>
