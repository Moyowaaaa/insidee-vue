<template>
    <div className="item-swiper">
        <button
          className="item-swiper__left-arrow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 14 13"
            fill="none"
          >
            <path
              d="M8.70001 9.59996L5.5 6.39996L8.70001 3.19995"
              stroke="#525252"
              strokeWidth="1.28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="item-swiper__right-arrow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 14 13"
            fill="none"
          >
            <path
              d="M5.29999 9.59996L8.5 6.39996L5.29999 3.19995"
              stroke="#525252"
              strokeWidth="1.28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
</template>

<script setup lang="ts">

interface Props {
  currentIndex: number;
//   setCurrentIndex: React.Dispatch<SetStateAction<number>>;
  itemCount: number;
}




defineProps<Props>()


</script>

<style scoped lang="scss">
.item-swiper {
  width: 80%;
  display: flex;
  align-items: center;
  gap: 1.125rem;
  height: max-content !important;
  justify-content: space-between !important;
  position: absolute;
  bottom: 2rem;
  z-index: 5;

  button {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: #f0f0f0;
    outline: none;
    border: none;

    cursor: pointer;
    svg {
      height: 0.875rem;
      width: 0.875rem;
    }
  }
}

</style>