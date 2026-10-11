<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { Toaster, toast } from 'vue-sonner'
import TheTopBar from '@/components/layout/TheTopBar.vue'
import { ToastNo, ToastOk } from '@/components/ui/toastIcons'
import { useLenis } from '@/composables/useLenis'
import { useLocationStore } from '@/stores/location'

useLenis()

const location = useLocationStore()

const locationCopy = (message: string) => {
  if (/denied/i.test(message)) return 'Location permission was denied.'
  if (/unavailable/i.test(message)) return 'Your location is unavailable right now.'
  if (/timeout/i.test(message)) return 'Finding your location took too long.'
  return 'We couldn’t find where you are.'
}

onMounted(async () => {
  await location.detect()
  if (location.error) {
    toast.error('Location off', { description: locationCopy(location.error) })
    return
  }

  const parts = location.place?.address_components ?? []
  const where = [parts[2]?.short_name, parts[3]?.short_name].filter(Boolean).join(', ')
  toast.success(where || 'Location found', { description: 'Showing places of interests around you.' })
})
</script>

<template>
  <TheTopBar />
  <RouterView />
  <Toaster
    position="top-center"
    theme="light"
    :offset="28"
    :duration="3800"
    :visible-toasts="2"
    :icons="{ success: ToastOk, error: ToastNo }"
  />
</template>
