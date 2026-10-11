<script setup lang="ts">
import { computed, ref } from 'vue'
import { matchPlaceTypes, type PlaceTypeOption } from '@/features/placeTypes'
import type { spot } from '@/features/types'

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  select: [spot]
}>()

const query = ref('')
const matches = computed(() => matchPlaceTypes(query.value))

const close = () => {
  open.value = false
  query.value = ''
}

const choose = (option: PlaceTypeOption) => {
  emit('select', {
    name: option.label,
    image: '/images/others.png',
    interests: [option.type],
  })
  close()
}

const submit = () => {
  const first = matches.value[0]
  if (query.value.trim() && first) choose(first)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="finder" data-lenis-prevent-wheel>
      <button type="button" class="finder__overlay" aria-label="Close" @click="close"></button>
      <div class="finder__panel" role="dialog" aria-labelledby="finder-title" @click.stop>
        <header class="finder__header">
          <h2 id="finder-title">Something else</h2>
          <button type="button" class="finder__close" aria-label="Close" @click="close">×</button>
        </header>

        <p class="finder__note">
          Search another kind of place. Insidee still looks nearby, the same way the cards do.
        </p>

        <form class="finder__form" @submit.prevent="submit">
          <input
            v-model="query"
            type="text"
            name="type"
            placeholder="Pharmacy, park, bookstore…"
            autocomplete="off"
          />
          <button type="submit" :disabled="!query.trim() || !matches.length">Search</button>
        </form>

        <ul v-if="matches.length" class="finder__matches">
          <li v-for="option in matches" :key="option.type">
            <button type="button" @click="choose(option)">{{ option.label }}</button>
          </li>
        </ul>
        <p v-else class="finder__message">
          That type isn’t in the list. Try pharmacy, park, or bookstore.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts' as *;

.finder {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6.5rem 1rem 1rem;

  &__overlay {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(0, 0, 0, 0.35);
    cursor: pointer;
  }

  &__panel {
    position: relative;
    z-index: 1;
    width: min(28rem, 100%);
    max-height: min(32rem, calc(100vh - 8rem));
    overflow: auto;
    padding: 1.25rem 1.25rem 1.4rem;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 16px 40px rgba(51, 51, 51, 0.12);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      margin: 0;
      font-family: $font-display;
      font-size: 2rem;
      line-height: 1;
      color: #333;
    }
  }

  &__close {
    width: 2rem;
    height: 2rem;
    border: 0;
    border-radius: 8px;
    background: #f0f0f0;
    color: #333;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
  }

  &__note {
    margin: 0.85rem 0 0;
    color: #525252;
    font-family: $font-body;
    font-size: 0.8rem;
    line-height: 1.45;
  }

  &__form {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;

    input {
      flex: 1;
      min-width: 0;
      padding: 0.55rem 0.7rem;
      border: 0;
      border-radius: 8px;
      background: #f0f0f0;
      color: #333;
      font-family: $font-body;
      font-size: 0.85rem;
    }

    button {
      border: 0;
      border-radius: 8px;
      padding: 0.45rem 0.7rem;
      background: #525252;
      color: #f0f0f0;
      font-family: $font-display;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;

      &:disabled {
        opacity: 0.6;
        cursor: default;
      }
    }
  }

  &__matches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin: 0.9rem 0 0;
    padding: 0;
    list-style: none;

    button {
      border: 0;
      border-radius: 8px;
      padding: 0.4rem 0.7rem;
      background: #f0f0f0;
      color: #333;
      font-family: $font-display;
      font-size: 1.2rem;
      line-height: 1;
      cursor: pointer;
    }
  }

  &__message {
    margin: 0.85rem 0 0;
    color: #525252;
    font-family: $font-body;
    font-size: 0.78rem;
  }
}
</style>
