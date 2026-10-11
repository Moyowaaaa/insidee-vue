<script setup lang="ts">
import { ref } from 'vue'

const STORAGE_KEY = 'insidee:location-note'
const visible = ref(sessionStorage.getItem(STORAGE_KEY) !== '1')

const dismiss = () => {
  visible.value = false
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // The note can stay dismissed for this visit even if storage is blocked.
  }
}
</script>

<template>
  <aside v-if="visible" class="note" role="status">
    <p>
      Your location stays in this browser. Insidee sends it to Google only to find places nearby,
      and it is not stored on an Insidee server or used for anything else.
    </p>
    <button type="button" @click="dismiss">Got it</button>
  </aside>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts' as *;

.note {
  position: fixed;
  z-index: 20;
  top: 6.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: min(36rem, calc(100% - 2rem));
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  background: #f0f0f0;
  box-shadow: 0 10px 28px rgba(51, 51, 51, 0.08);

  p {
    margin: 0;
    color: #525252;
    font-family: $font-body;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  button {
    flex-shrink: 0;
    border: 0;
    border-radius: 8px;
    padding: 0.35rem 0.55rem;
    background: #525252;
    color: #f0f0f0;
    font-family: $font-display;
    font-size: 1.15rem;
    line-height: 1;
    cursor: pointer;
  }
}

@include respond-below('md') {
  .note {
    top: 4.5rem;
    align-items: flex-start;
  }
}
</style>
