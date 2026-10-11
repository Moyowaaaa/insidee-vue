<template>
  <div class="category-card" @click="emit('selectType', spot)">
    <div class="category-card__card">
      <div class="category-card__card--div"></div>
      <div class="category-card__card--div"></div>
      <div class="category-card__card--div">
        <img :src="spot.image" :alt="spot.name" />
      </div>

      <div v-if="spot.icon" class="category-card__card--div">
        <img :src="spot.icon" alt="" />
      </div>
    </div>

    <div class="category-card__desc-container">
      <h1 class="amatic-sc-bold">{{ spot.name }}</h1>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 18" fill="none">
        <path
          d="M9.5 9.75C10.7426 9.75 11.75 8.74264 11.75 7.5C11.75 6.25736 10.7426 5.25 9.5 5.25C8.25736 5.25 7.25 6.25736 7.25 7.5C7.25 8.74264 8.25736 9.75 9.5 9.75Z"
          stroke="#333333"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 16.5C12.5 13.5 15.5 10.8137 15.5 7.5C15.5 4.18629 12.8137 1.5 9.5 1.5C6.18629 1.5 3.5 4.18629 3.5 7.5C3.5 10.8137 6.5 13.5 9.5 16.5Z"
          stroke="#333333"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { spot } from '@/features/types'

defineProps<{
  spot: spot
}>()

const emit = defineEmits<{
  selectType: [type: spot]
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts' as *;

.category-card {
  height: max-content;
  width: 21.625rem;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  cursor: pointer;

  &__card {
    height: 13.78rem;
    position: relative;

    &--div {
      height: 100%;
      width: 100%;
      border-radius: 1rem;
      position: absolute;
      top: 0;
      transform-origin: center center;
      transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      animation-duration: 0.7s;
      animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
      animation-fill-mode: backwards;
      animation-delay: var(--enter-delay, 0ms);

      &:nth-child(1) {
        z-index: 1;
        background-color: #d9d9d9;
        transform: rotate(-12deg);
        animation-name: stack-back;
      }

      &:nth-child(2) {
        z-index: 2;
        background-color: #b4b4b4;
        transform: rotate(16.122deg);
        animation-name: stack-mid;
      }

      &:nth-child(3) {
        background-color: transparent;
        z-index: 3;
        animation-name: stack-front;

        img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          border-radius: 1rem;
        }
      }

      &:nth-child(4) {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        z-index: 4;
        display: flex;
        align-items: center;
        justify-content: center;
        animation-name: stack-front;

        img {
          height: 5.625rem;
          width: 5.625rem;
        }
      }
    }

    // img {
    //   height: 100%;
    //   width: 100%;
    //   object-fit: cover;
    //   position: absolute;
    //   top: 0;

    //   &:nth-child(2) {
    //   }
    // }
  }

  &:hover &__card--div:nth-child(1) {
    transform: rotate(-18deg) translate(-10px, 8px);
  }

  &:hover &__card--div:nth-child(2) {
    transform: rotate(20deg) translate(10px, -4px);
  }

  &:hover &__card--div:nth-child(3) {
    transform: translateY(-8px);
  }

  &__desc-container {
    display: flex;
    align-items: center;
    width: max-content;
    height: max-content;
    border-radius: 0.5rem;
    background-color: #f0f0f0;
    margin: auto;

    display: inline-flex;
    height: 2.75rem;
    padding: 0 0.313rem;
    justify-content: center;
    align-items: center;
    gap: 0.625rem;

    svg {
      height: 1.125rem;
      width: 1.125rem;
    }

    h1 {
      font-size: 1.5rem;
      color: #333;
    }
  }
}

@keyframes stack-back {
  from {
    opacity: 0;
    transform: rotate(0deg) translateY(12px) scale(0.96);
  }
}

@keyframes stack-mid {
  from {
    opacity: 0;
    transform: rotate(0deg) translateY(10px) scale(0.96);
  }
}

@keyframes stack-front {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.94);
  }
}

@include respond-below('md') {
  .category-card {
    width: 17.75rem;
    gap: 1.35rem;

    &__card {
      height: 13.9rem;

      &--div {
        width: 15.625rem;
        height: 9.96rem;
        left: 1.06rem;
        top: 1.95rem;

        &:nth-child(4) {
          width: 15.625rem;
          height: 9.96rem;
          left: 1.06rem;
          top: 1.95rem;
        }
      }
    }

    &__desc-container {
      height: auto;
      padding: 3px 10px;
      border-radius: 8px;

      h1 {
        font-size: 20px;
      }

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-card__card--div {
    animation: none;
    transition: none;
  }
}
</style>
