<template>
  <div class="modal">
    <div class="modal__overlay" @click="modal.toggleModal()"></div>

    <div ref="panelEl" class="modal__panel" data-lenis-prevent-wheel @click.stop>
      <img class="modal__dash modal__dash--top" :src="dashTop" width="350" height="23" alt="" />
      <img
        class="modal__dash modal__dash--bottom"
        :src="dashBottom"
        width="350"
        height="23"
        alt=""
      />
      <img class="modal__bus" :src="bus" width="74" height="56" alt="" />

      <header class="modal__header">
        <div class="modal__title">
          <h1>{{ type.name }}</h1>
          <img v-if="type.icon" :src="type.icon" alt="" />
        </div>

        <button type="button" class="modal__close" aria-label="Close" @click="modal.toggleModal()">
          <img :src="closeIcon" width="22" height="22" alt="" />
        </button>
      </header>

      <div v-if="isEmpty" class="empty">
        <img :src="emptyFace" width="42" height="42" alt="" />
        <p>Sorry you couldn’t find a place, you could try going through the list again</p>
        <button type="button" @click="modal.toggleModal()">See the list again</button>
      </div>

      <p v-else-if="status" class="modal__status">{{ status }}</p>

      <div v-else-if="currentPlace" class="modal__body">
        <section
          class="stack"
          :class="shiftClass"
          aria-label="Place"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
        >
          <div class="stack__back"></div>
          <div class="stack__middle"></div>

          <Transition :name="deckName">
            <div v-if="heroUrl" :key="currentPlace.id" class="stack__photo">
              <img :src="heroUrl" :alt="placeName" />
            </div>
          </Transition>

          <div class="stack__stars">
            <StarIcon v-for="star in 5" :key="star" :filled="star <= rating" />
          </div>

          <button type="button" class="stack__share" aria-label="Share" @click="sharePlace">
            <img :src="shareIcon" width="17" height="17" alt="" />
          </button>

          <Transition name="info">
            <div :key="currentPlace.id" class="stack__info">
              <div class="stack__info-top">
                <span class="stack__hours">{{ hours }}</span>
                <span v-if="distance" class="stack__distance">
                  <img :src="routeIcon" width="14" height="14" alt="" />
                  {{ distance }}
                </span>
              </div>
              <p class="stack__name">{{ placeName }}</p>
              <p class="stack__address">{{ currentPlace.formattedAddress }}</p>
              <button
                type="button"
                class="stack__bookmark"
                :aria-pressed="saved"
                aria-label="Save place"
                @click="saved = !saved"
              >
                <img :src="bookmarkIcon" width="16" height="16" alt="" />
              </button>
            </div>
          </Transition>

          <div v-if="results.length > 1" class="pager">
            <button
              type="button"
              class="pager__chevron"
              aria-label="Previous place"
              @click="stepPlace(-1)"
            >
              <img :src="chevronIcon" width="12.8" height="12.8" alt="" />
            </button>
            <div class="pager__dots">
              <button
                v-for="dot in results.length"
                :key="dot"
                type="button"
                class="pager__dot"
                :class="{ 'pager__dot--active': dot - 1 === activeIndex }"
                :aria-label="`Place ${dot}`"
                @click="showPlace(dot - 1)"
              />
            </div>
            <button
              type="button"
              class="pager__chevron pager__chevron--next"
              aria-label="Next place"
              @click="stepPlace(1)"
            >
              <img :src="chevronIcon" width="12.8" height="12.8" alt="" />
            </button>
          </div>

          <button
            v-if="results.length > 1"
            type="button"
            class="swipe-hint"
            @click="stepPlace(1)"
          >
            Swipe to see more
            <img :src="swipeDown" width="13.824" height="13.824" alt="" />
          </button>
        </section>

        <section class="side" aria-label="Photos">
          <div class="side__back" aria-hidden="true"></div>
          <div class="side__middle" aria-hidden="true"></div>
          <Transition name="photo">
            <img
              v-if="currentPhoto"
              :key="currentPhoto"
              class="side__photo"
              :src="currentPhoto"
              alt=""
            />
          </Transition>
          <p v-if="!currentPhoto" class="side__empty">No photos for this place.</p>
          <div v-if="sidePhotos.length > 1" class="pager pager--side">
            <button
              type="button"
              class="pager__chevron"
              aria-label="Previous photo"
              @click="stepPhoto(-1)"
            >
              <img :src="chevronIcon" width="12.8" height="12.8" alt="" />
            </button>
            <div class="pager__dots">
              <button
                v-for="dot in sidePhotos.length"
                :key="dot"
                type="button"
                class="pager__dot"
                :class="{ 'pager__dot--active': dot - 1 === photoIndex }"
                :aria-label="`Photo ${dot}`"
                @click="photoIndex = dot - 1"
              />
            </div>
            <button
              type="button"
              class="pager__chevron pager__chevron--next"
              aria-label="Next photo"
              @click="stepPhoto(1)"
            >
              <img :src="chevronIcon" width="12.8" height="12.8" alt="" />
            </button>
          </div>

          <button
            v-if="sidePhotos.length > 1"
            type="button"
            class="swipe-hint"
            @click="stepPhoto(1)"
          >
            Swipe to see more
            <img :src="swipeDown" width="13.824" height="13.824" alt="" />
          </button>
        </section>

        <section class="reviews" data-lenis-prevent-wheel aria-label="Reviews">
          <p v-if="!reviewList.length" class="reviews__empty">No reviews for this place.</p>
          <article
            v-for="(review, index) in reviewList"
            :key="`${review.authorAttribution?.displayName ?? 'review'}-${index}`"
            class="reviews__card"
          >
            <div class="reviews__head">
              <h2>{{ review.authorAttribution?.displayName || 'Anonymous' }}</h2>
              <div class="reviews__stars">
                <StarIcon
                  v-for="star in 5"
                  :key="star"
                  :filled="star <= Math.round(review.rating ?? 0)"
                />
              </div>
            </div>
            <p>{{ review.text }}</p>
          </article>
        </section>

        <button type="button" class="back-top" @click="backToTop">
          Back to the top
          <img :src="arrowUp" width="14" height="14" alt="" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { spot } from '@/features/types'
import type { LatLng } from '@/types'
import useModalStore from '@/stores/modal'
import { usePlacesStore } from '@/stores/places'
import { useLocationStore } from '@/stores/location'
import StarIcon from '@/components/ui/StarIcon.vue'
import dashTop from '@/assets/images/place-modal/dash-top.svg'
import dashBottom from '@/assets/images/place-modal/dash-bottom.svg'
import closeIcon from '@/assets/images/place-modal/close.svg'
import routeIcon from '@/assets/images/place-modal/route.svg'
import bookmarkIcon from '@/assets/images/place-modal/bookmark.svg'
import shareIcon from '@/assets/images/place-modal/share.svg'
import chevronIcon from '@/assets/images/place-modal/chevron-left.svg'
import bus from '@/assets/images/place-modal/bus.svg'
import emptyFace from '@/assets/images/place-modal/empty-face.svg'
import swipeDown from '@/assets/images/place-modal/swipe-down.svg'
import arrowUp from '@/assets/images/place-modal/arrow-up.svg'

const props = defineProps<{
  type: spot
}>()

const modal = useModalStore()
const places = usePlacesStore()
const location = useLocationStore()
const { results, isFetching, error, activeIndex } = storeToRefs(places)

const panelEl = ref<HTMLElement | null>(null)
const saved = ref(false)
let touchStartX = 0
let touchStartY = 0
const photoIndex = ref(0)
const deckName = ref<'deck-next' | 'deck-prev'>('deck-next')
const shiftClass = ref('')
const detailsById = ref<Record<string, { name: string; hours: string }>>({})
let shiftTimer = 0

watch(activeIndex, () => {
  photoIndex.value = 0
})

watch(
  () => [props.type, location.coords] as const,
  ([spot, coords]) => {
    if (spot && coords) places.search(spot)
  },
  { immediate: true },
)

const currentPlace = computed(() => results.value[activeIndex.value])

const status = computed(() => {
  if (!location.coords) {
    return location.isResolving
      ? 'Finding your location…'
      : 'Turn on location to see places nearby.'
  }
  if (isFetching.value) return 'Finding places nearby…'
  if (error.value) return error.value
  return ''
})

const isEmpty = computed(
  () => !!location.coords && !isFetching.value && !error.value && !results.value.length,
)

const photoUrl = (index: number) => {
  const photo = currentPlace.value?.photos?.[index]
  return photo ? photo.getURI({ maxWidth: 1200 }) : ''
}

const heroUrl = computed(() => photoUrl(0))

const sidePhotos = computed(() => {
  const photos = currentPlace.value?.photos ?? []
  const list = photos.length > 1 ? photos.slice(1) : photos
  return list.map((photo) => photo.getURI({ maxWidth: 1200 }))
})

const currentPhoto = computed(() => sidePhotos.value[photoIndex.value] ?? '')

const rating = computed(() => Math.round(currentPlace.value?.rating ?? 0))

const formatClock = (hour: number, minute: number) => {
  const h = hour % 12 || 12
  const m = minute ? `:${String(minute).padStart(2, '0')}` : ''
  return `${h}${m}${hour >= 12 ? 'pm' : 'am'}`
}

const hoursFrom = (place: { regularOpeningHours?: google.maps.places.OpeningHours | null }) => {
  const periods = place.regularOpeningHours?.periods
  if (!periods?.length) return 'Hours unavailable'
  const today = new Date().getDay()
  const period = periods.find((item) => item.open.day === today) ?? periods[0]
  if (!period?.close) return 'Open 24 hours'
  return `Open from ${formatClock(period.open.hour, period.open.minute)} to ${formatClock(period.close.hour, period.close.minute)}`
}

const placeName = computed(() => {
  const place = currentPlace.value
  if (!place?.id) return place?.displayName ?? ''
  return detailsById.value[place.id]?.name || place.displayName || ''
})

const loadDetails = async (place: google.maps.places.Place) => {
  const id = place.id
  if (!id || detailsById.value[id]) return

  if (place.displayName && place.regularOpeningHours?.periods?.length) {
    detailsById.value = {
      ...detailsById.value,
      [id]: { name: place.displayName, hours: hoursFrom(place) },
    }
    return
  }

  const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary
  const fresh = new Place({ id })
  await fresh.fetchFields({ fields: ['displayName', 'regularOpeningHours'] })
  detailsById.value = {
    ...detailsById.value,
    [id]: {
      name: fresh.displayName ?? '',
      hours: hoursFrom(fresh),
    },
  }
}

watch(
  currentPlace,
  (place) => {
    if (place) void loadDetails(place)
  },
  { immediate: true },
)

const reviewList = computed(() => currentPlace.value?.reviews ?? [])

const hours = computed(() => {
  const place = currentPlace.value
  if (!place) return ''
  return (place.id && detailsById.value[place.id]?.hours) || hoursFrom(place)
})

const kmBetween = (from: LatLng, lat: number, lng: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat - from.lat)
  const dLng = toRad(lng - from.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const distance = computed(() => {
  const from = location.coords
  const to = currentPlace.value?.location
  if (!from || !to) return ''
  const km = kmBetween(from, to.lat(), to.lng())
  const label = km < 10 ? km.toFixed(1) : String(Math.round(km))
  return `${label}km from you`
})

const nudgeDeck = (name: 'deck-next' | 'deck-prev') => {
  deckName.value = name
  shiftClass.value = name === 'deck-next' ? 'stack--next' : 'stack--prev'
  window.clearTimeout(shiftTimer)
  shiftTimer = window.setTimeout(() => {
    shiftClass.value = ''
  }, 520)
}

const showPlace = (index: number) => {
  if (index === activeIndex.value) return
  const count = results.value.length
  const forward =
    (index - activeIndex.value + count) % count <= (activeIndex.value - index + count) % count
  nudgeDeck(forward ? 'deck-next' : 'deck-prev')
  places.selectPlace(index)
}

const onTouchStart = (event: TouchEvent) => {
  const touch = event.changedTouches[0]
  if(touch){
    touchStartX = touch.clientX
    touchStartY = touch.clientY
  }
 
}

const onTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0]
  if(touch){

  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
  stepPlace(dx < 0 ? 1 : -1)
  }
}

const backToTop = () => {
  panelEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const stepPlace = (direction: number) => {
  const count = results.value.length
  if (!count) return
  nudgeDeck(direction > 0 ? 'deck-next' : 'deck-prev')
  places.selectPlace((activeIndex.value + direction + count) % count)
}

onBeforeUnmount(() => {
  window.clearTimeout(shiftTimer)
})

const stepPhoto = (direction: number) => {
  const count = sidePhotos.value.length
  if (!count) return
  photoIndex.value = (photoIndex.value + direction + count) % count
}

const sharePlace = () => {
  const place = currentPlace.value
  const point = place?.location
  const query = point
    ? `${point.lat()},${point.lng()}`
    : `${place?.displayName ?? ''} ${place?.formattedAddress ?? ''}`.trim()
  if (!query) return
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    '_blank',
    'noopener',
  )
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts' as *;

.modal {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  &.modal-enter-active,
  &.modal-leave-active {
    .modal__overlay {
      transition: opacity 0.4s $ease-out;
    }

    .modal__panel {
      transition:
        opacity 0.42s $ease-out,
        transform 0.5s $ease-out;
    }
  }

  &.modal-enter-active {
    .stack,
    .side,
    .reviews {
      animation: modal-rise 0.55s $ease-out both;
    }

    .side {
      animation-delay: 0.06s;
    }

    .reviews {
      animation-delay: 0.12s;
    }
  }

  &.modal-enter-from,
  &.modal-leave-to {
    .modal__overlay {
      opacity: 0;
    }

    .modal__panel {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &__panel {
    position: relative;
    z-index: 1;
    width: calc(100% - 3rem);
    max-width: 82rem;
    height: max-content;
    min-height: 40rem;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;
    padding: 2.5rem 2.5rem 2.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
  }

  &__dash {
    position: absolute;
    pointer-events: none;

    &--top {
      left: -3.7rem;
      top: -2.4rem;
      transform: scaleY(-1) rotate(-12.95deg);
    }

    &--bottom {
      right: 1.5rem;
      bottom: 1.6rem;
      transform: rotate(-5.93deg);
    }
  }

  &__bus {
    position: absolute;
    right: 2.4rem;
    bottom: 1.1rem;
    pointer-events: none;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.55rem;

    h1 {
      margin: 0;
      font-family: $font-display;
      font-weight: 700;
      font-size: 45px;
      line-height: 1;
      color: #333;
    }

    img {
      width: 3rem;
      height: 3rem;
      object-fit: contain;
    }
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border: 0;
    border-radius: 12px;
    background: #f0f0f0;
    cursor: pointer;

    img {
      width: 22px;
      height: 22px;
      max-width: none;
    }
  }

  &__status {
    margin: auto;
    font-family: $font-display;
    font-size: 32px;
    color: #525252;
    text-align: center;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 94px 2rem;
    background: #e7e7e7;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 42px;
      height: 42px;
      max-width: none;
      flex-shrink: 0;
    }

    p {
      max-width: 11.15rem;
      font-family: $font-display;
      font-weight: $fw-bold;
      font-size: 14px;
      line-height: normal;
      color: #525252;
      text-align: center;
    }

    button {
      border: 0;
      background: #525252;
      color: #f0f0f0;
      border-radius: 6px;
      padding: 3px 5px;
      font-family: $font-display;
      font-weight: $fw-bold;
      font-size: 14px;
      line-height: normal;
      white-space: nowrap;
      cursor: pointer;
    }
  }

  &__body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2.2rem;
    min-height: 0;
    flex: 1;
  }
}

.stack {
  position: relative;
  width: 359px;
  height: 521px;
  flex: 0 0 359px;
  overflow: hidden;

  &__back,
  &__middle,
  &__photo {
    position: absolute;
    border-radius: 16px;
  }

  &__back,
  &__middle {
    transition: transform 0.48s cubic-bezier(0.22, 0.8, 0.24, 1);
  }

  &.stack--next &__middle {
    transform: translate3d(-12px, -10px, 0) rotate(-4deg);
  }

  &.stack--next &__back {
    transform: translate3d(10px, 8px, 0) rotate(3deg);
  }

  &.stack--prev &__middle {
    transform: translate3d(12px, 10px, 0) rotate(4deg);
  }

  &.stack--prev &__back {
    transform: translate3d(-8px, 6px, 0) rotate(-2deg);
  }

  &__back {
    left: 79px;
    top: 70px;
    width: 280px;
    height: 422px;
    background: #8c8a8a;
    border-radius: 13px;
  }

  &__middle {
    left: 33px;
    top: 19px;
    width: 321px;
    height: 483px;
    background: #c9c3c3;
    border-radius: 15px;
  }

  &__photo {
    left: 0;
    top: 0;
    width: 346px;
    height: 521px;
    overflow: hidden;
    border-radius: 16px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
  }

  &__stars,
  &__share,
  &__info,
  .pager {
    position: absolute;
    z-index: 2;
  }

  &__stars,
  &__share {
    top: 19px;
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    background: #f0f0f0;
  }

  &__stars {
    left: 16px;
    gap: 4px;
  }

  &__share {
    right: 28px;
    border: 0;
    cursor: pointer;

    img {
      width: 17px;
      height: 17px;
      max-width: none;
    }
  }

  &__info {
    left: 7px;
    top: 69px;
    width: 332px;
    min-height: 103px;
    padding: 12px 16px 16px;
    border-radius: 8px;
    background: #f0f0f0;
  }

  &__info-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__hours {
    padding: 3px 5px;
    border-radius: 6px;
    background: #525252;
    color: #f0f0f0;
    font-family: $font-display;
    font-weight: 700;
    font-size: 12px;
    line-height: 1;
    text-transform: uppercase;
  }

  &__distance {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #525252;
    font-family: $font-display;
    font-weight: 700;
    font-size: 14px;
    line-height: 1;
    text-transform: uppercase;

    img {
      width: 14px;
      height: 14px;
      max-width: none;
    }
  }

  &__name,
  &__address {
    margin: 0;
    font-family: $font-display;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__name {
    margin-top: 6px;
    color: #333;
    font-size: 24px;
    line-height: 1.05;
  }

  &__address {
    margin-top: 2px;
    color: #525252;
    font-size: 14px;
    line-height: 1;
  }

  &__bookmark {
    position: absolute;
    right: 15px;
    bottom: 12px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;

    img {
      width: 16px;
      height: 16px;
      max-width: none;
    }

    &[aria-pressed='true'] {
      transform: scale(1.08);
    }
  }

  .pager {
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
  }
}

.side {
  position: relative;
  display: flex;
  width: 346px;
  height: 521px;
  flex: 0 0 346px;
  border-radius: 16px;
  overflow: hidden;

  &__back,
  &__middle {
    display: none;
  }

  &__photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__empty {
    position: relative;
    z-index: 2;
    margin: auto;
    padding: 1rem;
    color: #f0f0f0;
    font-family: $font-body;
    font-size: 14px;
    text-align: center;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  .pager {
    position: absolute;
    z-index: 1;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
  }
}

.pager {
  display: flex;
  align-items: center;
  gap: 18px;

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 0;
    border-radius: 6.4px;
    background: #f0f0f0;
    cursor: pointer;

    img {
      display: block;
      width: 12.8px;
      height: 12.8px;
      max-width: none;
    }

    &--next {
      transform: rotate(180deg);
    }
  }

  &__dots {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 10px;
    border-radius: 8px;
    background: #f0f0f0;
  }

  &__dot {
    width: 6px;
    height: 4px;
    padding: 0;
    border: 0;
    border-radius: 2px;
    background: #a2a2a2;
    cursor: pointer;

    &--active {
      width: 20px;
      background: #525252;
    }
  }
}

.reviews {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 449px;
  flex: 0 0 449px;
  max-height: 521px;
  overflow-y: auto;
  overscroll-behavior: contain;

  &__empty {
    margin: 0;
    color: #525252;
    font-family: $font-body;
    font-size: 14px;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 20px;
    border-radius: 8px;
    background: #f0f0f0;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      margin: 0;
      font-family: $font-display;
      font-weight: 400;
      font-size: 24px;
      line-height: 1;
      color: #333;
      text-transform: uppercase;
    }
  }

  &__stars {
    display: flex;
    gap: 4px;
  }

  p {
    margin: 0;
    font-family: $font-body;
    font-size: 13px;
    line-height: normal;
    color: #333;
  }
}

.deck-next-enter-active,
.deck-next-leave-active,
.deck-prev-enter-active,
.deck-prev-leave-active {
  transition:
    transform 0.48s cubic-bezier(0.22, 0.8, 0.24, 1),
    opacity 0.48s ease;
}

.deck-next-leave-active,
.deck-prev-leave-active {
  z-index: 3;
}

.deck-next-enter-from,
.deck-prev-leave-to {
  transform: translate3d(42px, 26px, 0) rotate(8deg);
  opacity: 0;
}

.deck-next-leave-to,
.deck-prev-enter-from {
  transform: translate3d(-64px, -28px, 0) rotate(-12deg);
  opacity: 0;
}

.info-enter-active,
.info-leave-active,
.photo-enter-active,
.photo-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s ease;
}

.info-enter-from,
.info-leave-to,
.photo-enter-from,
.photo-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes modal-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.swipe-hint,
.back-top {
  display: none;
}

@include respond-below('md') {
  .modal {
    align-items: stretch;

    &__dash,
    &__bus {
      display: none;
    }

    &__panel {
      width: 100%;
      max-width: none;
      height: 100%;
      min-height: 0;
      border-radius: 0;
      padding: 37px 19px 32px;
      overflow-y: auto;
    }

    &__title {
      img {
        display: none;
      }

      h1 {
        font-size: 32px;
      }
    }

    &__body {
      flex-direction: column;
      align-items: center;
      gap: 48px;
      margin-top: 28px;
    }

    .empty {
      width: min(284px, 100%);
      height: 428px;
      margin: 48px auto 0;
      padding: 0 1.25rem;
      border-radius: 13px;
      flex: none;

      img {
        display: none;
      }

      p {
        max-width: 170px;
      }
    }
  }

  .stack {
    width: min(307px, 100%);
    height: calc(min(307px, 100%) * 469 / 307);
    flex-basis: auto;

    &__photo {
      width: 100%;
      height: 98.5%;
    }

    &__back {
      left: 9.4%;
      top: 20.3%;
      width: 80.8%;
      height: 79.7%;
    }

    &__middle {
      left: 3.7%;
      top: 8.1%;
      width: 92.5%;
      height: 91.3%;
    }

    &__info {
      left: 3.5%;
      top: 15.4%;
      width: 93%;
    }

    &__name {
      max-width: 170px;
    }

    .pager {
      display: none;
    }
  }

  .side {
    width: min(307px, 100%);
    height: calc(min(307px, 100%) * 469 / 307);
    flex-basis: auto;
    order: 3;
    background: transparent;

    &__back,
    &__middle {
      display: block;
      position: absolute;
      border-radius: 13px;
    }

    &__back {
      left: 9.4%;
      top: 20.3%;
      width: 80.8%;
      height: 79.7%;
      background: #8c8a8a;
    }

    &__middle {
      left: 3.7%;
      top: 8.1%;
      width: 92.5%;
      height: 91.3%;
      border-radius: 15px;
      background: #c9c3c3;
    }

    &__photo {
      inset: auto;
      top: 0;
      left: 0;
      width: 100%;
      height: 98.5%;
      border-radius: 16px;
    }

    &::after {
      inset: auto;
      top: 0;
      left: 0;
      width: 100%;
      height: 98.5%;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 16px;
    }

    .pager {
      display: none;
    }
  }

  .reviews {
    order: 2;
    width: min(307px, 100%);
    flex-basis: auto;
    max-height: none;
    overflow: visible;
    gap: 12px;
  }

  .swipe-hint,
  .back-top {
    position: absolute;
    left: 50%;
    bottom: 16px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 4px;
    transform: translateX(-50%);
    padding: 3px 5px;
    border: 0;
    border-radius: 6px;
    background: rgba(82, 82, 82, 0.8);
    color: #f0f0f0;
    font-family: $font-display;
    font-weight: $fw-bold;
    font-size: 14px;
    line-height: normal;
    white-space: nowrap;
    cursor: pointer;

    img {
      width: auto;
      height: auto;
      max-width: none;
    }
  }

  .back-top {
    position: static;
    transform: none;
    align-self: center;
    order: 4;
    margin-top: 8px;
    background: #525252;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal.modal-enter-active,
  .modal.modal-leave-active {
    .modal__overlay,
    .modal__panel,
    .stack,
    .side,
    .reviews {
      animation: none;
      transition: none;
    }
  }
}

.empty {
  position: relative;
  z-index: 1;
  width: calc(100% - 3rem);
  max-width: 648px;
  margin: auto;
  height: max-content;
  // min-height: 40rem;
  overflow: hidden;
  border-radius: 12px;
  padding: 2.5rem 2.5rem 2.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  align-items: center;
  justify-content: center;
  background-color: #e7e7e7;
}
</style>
