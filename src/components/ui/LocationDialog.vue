<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useLocationStore } from '@/stores/location'
import type { GeocoderResult } from '@/types'

const open = defineModel<boolean>({ required: true })

const location = useLocationStore()
const query = ref('')
const matches = ref<GeocoderResult[]>([])
const message = ref('')
const isSearching = ref(false)

const close = () => {
  open.value = false
  message.value = ''
}

const search = async () => {
  message.value = ''
  matches.value = []
  if (!query.value.trim()) return
  try {
    isSearching.value = true
    matches.value = await location.searchAddress(query.value)
    if (!matches.value.length) message.value = 'No place matched that search.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Could not search that place.'
  } finally {
    isSearching.value = false
  }
}

const choose = (result: GeocoderResult) => {
  location.choose(result)
  toast.success(location.areaLabel || 'Location set', {
    description: 'Showing places of interests around there.',
  })
  close()
}

const useDevice = async () => {
  message.value = ''
  await location.detect()
  if (location.error) {
    message.value = /denied/i.test(location.error)
      ? 'The browser is still blocking location. Allow it in the site settings, or type an address instead.'
      : 'Your location is still unavailable. Type an address instead.'
    return
  }
  toast.success(location.areaLabel || 'Location found', {
    description: 'Showing places of interests around you.',
  })
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="sheet" data-lenis-prevent-wheel>
      <button type="button" class="sheet__overlay" aria-label="Close" @click="close"></button>
      <div class="sheet__panel" role="dialog" aria-labelledby="location-title" @click.stop>
        <header class="sheet__header">
          <h2 id="location-title">Your location</h2>
          <button type="button" class="sheet__close" aria-label="Close" @click="close">×</button>
        </header>

        <p class="sheet__note">
          Insidee uses your location only to find places nearby. It stays in this browser and is
          sent to Google for that search. It is not stored on an Insidee server or used for
          anything else.
        </p>

        <form class="sheet__form" @submit.prevent="search">
          <input
            v-model="query"
            type="text"
            name="place"
            placeholder="Neighborhood or address"
            autocomplete="off"
          />
          <button type="submit" :disabled="isSearching">
            {{ isSearching ? 'Searching' : 'Search' }}
          </button>
        </form>

        <ul v-if="matches.length" class="sheet__matches">
          <li v-for="match in matches" :key="match.place_id">
            <button type="button" @click="choose(match)">
              {{ match.formatted_address }}
            </button>
          </li>
        </ul>

        <p v-if="message" class="sheet__message">{{ message }}</p>

        <button type="button" class="sheet__device" :disabled="location.isResolving" @click="useDevice">
          {{ location.isResolving ? 'Finding you' : 'Use my current location' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts' as *;

.sheet {
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
    flex-direction: column;
    gap: 0.4rem;
    margin: 0.85rem 0 0;
    padding: 0;
    list-style: none;

    button {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: 0;
      border-radius: 8px;
      background: #f0f0f0;
      color: #333;
      font-family: $font-body;
      font-size: 0.78rem;
      text-align: left;
      cursor: pointer;
    }
  }

  &__message {
    margin: 0.75rem 0 0;
    color: #525252;
    font-family: $font-body;
    font-size: 0.78rem;
  }

  &__device {
    margin-top: 0.9rem;
    border: 0;
    border-radius: 8px;
    padding: 0.4rem 0.65rem;
    background: #f0f0f0;
    color: #333;
    font-family: $font-display;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}
</style>
