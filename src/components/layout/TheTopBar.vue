<script setup lang="ts">
import { useLocationStore } from '@/stores/location'
import { computed, ref } from 'vue'
import LocationDialog from '../ui/LocationDialog.vue'

const location = useLocationStore()
const locationOpen = ref(false)

const label = computed(() => location.areaLabel)

const missed = computed(() => !location.isResolving && !location.coords)
const settled = computed(() => !location.isResolving && !!location.coords && !!label.value)
</script>

<template>
  <header class="topBar">
    <div class="topBar__sound" aria-hidden="true"></div>
    <div class="topBar__title-container">Insidee</div>
    <div class="topBar__container">
      <button
        type="button"
        class="topBar__container--location-button"
        :class="{
          'is-found': settled,
          'is-missed': missed,
        }"
        aria-haspopup="dialog"
        :aria-expanded="locationOpen"
        @click="locationOpen = true"
      >
        <Transition name="loc" mode="out-in">
          <span v-if="location.isResolving" key="loading" class="loc">
            <span class="spinner" aria-hidden="true"></span>
          </span>
          <span v-else-if="missed" key="missed" class="loc">Location off</span>
          <h1 v-else key="found" class="amatic-sc-bold">{{ label }}</h1>
        </Transition>

        <svg class="topBar__pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 18" fill="none">
          <path
            d="M9.5 9.75C10.7426 9.75 11.75 8.74264 11.75 7.5C11.75 6.25736 10.7426 5.25 9.5 5.25C8.25736 5.25 7.25 6.25736 7.25 7.5C7.25 8.74264 8.25736 9.75 9.5 9.75Z"
            stroke="#333333"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9.5 16.5C12.5 13.5 15.5 10.8137 15.5 7.5C15.5 4.18629 12.8137 1.5 9.5 1.5C6.18629 1.5 3.5 4.18629 3.5 7.5C3.5 10.8137 6.5 13.5 9.5 16.5Z"
            stroke="#333333"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
    <LocationDialog v-model="locationOpen" />
  </header>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/abstracts' as *;

.topBar {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;

  &__container {
    width: 100%;
    max-width: 85rem;
    padding: 0 2rem;
    position: absolute;
    top: 2rem;
    display: flex;
    align-items: center;
    justify-content: end;

    &--location-button {
      display: flex;
      align-items: center;
      width: max-content;
      height: max-content;
      border: 0;
      background-color: #f0f0f0;
      color: inherit;
      font: inherit;
      cursor: pointer;

      border-radius: 0.5rem;
      padding: 0.625rem;
      gap: 0.625rem;

      h1 {
        font-size: 1.5rem;
        color: #333;
        font-family: $font-display;
        font-weight: $fw-bold;
      }

      &.is-found .topBar__pin {
        animation: pin-drop 0.55s $ease-out;
      }

      &.is-missed .topBar__pin {
        animation: pin-shake 0.45s ease;
      }
    }
  }

  &__title-container {
    position: absolute;
    top: 2rem;

    font-size: 2.813rem !important;
    font-family: $font-display;
    font-weight: $fw-bold;
  }

  &__sound {
    display: none;
  }
}

@include respond-below('md') {
  .topBar {
    &__title-container {
      top: 10px;
      left: 15%;
      transform: translateX(-50%);
      font-size: 36px !important;
    }

    &__container {
      top: 25px;
      padding: 0 16px;
    }

    &__container--location-button {
      padding: 5px;
      gap: 10px;
      border-radius: 8px;

      h1,
      .loc {
        font-size: 18px;
      }
    }

    &__pin {
      width: 15px;
      height: 15px;
    }

    &__sound {
      position: absolute;
      top: 81px;
      left: 16px;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__sound-chip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 5px 8px;
      border-radius: 12px;
      background: #f0f0f0;

      img {
        width: auto;
        height: auto;
        max-width: none;
      }

      &:last-child {
        padding: 5px 10px;
      }
    }
  }
}

svg {
  height: 1.125rem;
  width: 1.125rem;
}

.loc {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-body;
  font-size: 0.8rem;
  color: #525252;
}

.spinner {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  border: 1.5px solid #d4d4d4;
  border-top-color: #333;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.loc-enter-active,
.loc-leave-active {
  transition:
    opacity 0.28s $ease-out,
    transform 0.28s $ease-out;
}

.loc-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.loc-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pin-drop {
  0% {
    opacity: 0;
    transform: translateY(-6px) scale(0.86);
  }

  70% {
    opacity: 1;
    transform: translateY(1px) scale(1.04);
  }

  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes pin-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  30% {
    transform: translateX(-2px);
  }

  70% {
    transform: translateX(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .topBar__pin,
  .loc-enter-active,
  .loc-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
