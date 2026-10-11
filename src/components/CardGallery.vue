<template>
  <div class="card-section">
    <Transition name="modal">
      <PlaceModal v-if="openModal && selectedType" :type="selectedType" />
    </Transition>

    <div class="card-section__container">
      <template v-for="(spotType, index) in spotTypes" :key="spotType.name">
        <CategoryCard
          :spot="spotType"
          :style="{ '--enter-delay': `${index * 90}ms` }"
          @select-type="selectType"
        />
        <div v-if="index < spotTypes.length - 1" class="card-section__link" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 24" fill="none">
            <path
              d="M1 6.5L27.0548 1.91628C45.0695 -1.25296 63.6221 2.22755 79.2631 11.7107L80.1172 12.2285C103.698 26.5255 133.281 26.4899 156.827 12.1364V12.1364C178.417 -1.02492 205.241 -2.22224 227.918 8.96313L233.126 11.5317C253.803 21.7303 277.752 23.0255 299.408 15.1164L323 6.5"
              stroke="#7A7A7A"
              stroke-dasharray="9 9"
            />
          </svg>
          <img :src="bus" alt="" />
        </div>
      </template>
    </div>

    <div class="card-section__first-dash">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 24" fill="none">
        <path
          d="M1 6.5L27.0548 1.91628C45.0695 -1.25296 63.6221 2.22755 79.2631 11.7107L80.1172 12.2285C103.698 26.5255 133.281 26.4899 156.827 12.1364V12.1364C178.417 -1.02492 205.241 -2.22224 227.918 8.96313L233.126 11.5317C253.803 21.7303 277.752 23.0255 299.408 15.1164L323 6.5"
          stroke="#7A7A7A"
          strokeDasharray="9 9"
        />
      </svg>

      <img :src="bus" alt="" />
    </div>

    <div class="card-section__second-dash">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="324"
        height="24"
        viewBox="0 0 324 24"
        fill="none"
      >
        <path
          d="M1 6.5L27.0548 1.91628C45.0695 -1.25296 63.6221 2.22755 79.2631 11.7107L80.1172 12.2285C103.698 26.5255 133.281 26.4899 156.827 12.1364V12.1364C178.417 -1.02492 205.241 -2.22224 227.918 8.96313L233.126 11.5317C253.803 21.7303 277.752 23.0255 299.408 15.1164L323 6.5"
          stroke="#7A7A7A"
          strokeDasharray="9 9"
        />
      </svg>

      <img :src="bus" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { spotTypes } from '@/features/data.ts'
import CategoryCard from './CategoryCard.vue'
import type { spot } from '@/features/types.ts'
import PlaceModal from './ui/PlaceModal.vue'
import { ref } from 'vue'
import useModalStore from '@/stores/modal.ts'

const bus = '/images/bus.png'
const selectedType = ref<spot | null>(null)
const modal = useModalStore()
const { openModal } = storeToRefs(modal)

const selectType = (type: spot) => {
  selectedType.value = type
  modal.toggleModal()
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts' as *;

.card-section {
  width: 100%;

  left: 0;
  display: flex;
  justify-content: center;
  position: relative;

  &__container {
    width: 100%;
    max-width: 85rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &__first-dash {
    position: absolute;
    top: 8rem;
    left: 20rem;

    svg {
      width: 20.25rem;
      height: 1.5rem;
    }

    img {
      position: absolute;
      left: 8rem;
      bottom: 0;
      width: 3.625rem;
    }
  }

  &__second-dash {
    position: absolute;
    top: 8rem;
    right: 25rem;

    svg {
      width: 20.25rem;
      height: 1.5rem;
    }

    img {
      position: absolute;
      right: 3rem;
      bottom: 0;
      width: 3.625rem;
    }
  }

  &__link {
    display: none;
  }
}

@include respond-below('md') {
  .card-section__container {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .card-section__first-dash,
  .card-section__second-dash {
    display: none;
  }

  .card-section__link {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 6.5rem;

    svg {
      width: 8.5rem;
      height: 1.4rem;
      transform: rotate(-90deg);
    }

    img {
      position: absolute;
      width: 2.5rem;
      max-width: none;
    }
  }
}
</style>
