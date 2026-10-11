import Lenis from 'lenis'
import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Mounts a Lenis smooth-scroll instance for the lifetime of the calling
 * component and tears it down cleanly on unmount.
 *
 * Call once from the app root (App.vue) — not inside leaf components.
 */
export function useLenis(options?: ConstructorParameters<typeof Lenis>[0]) {
  let lenis: Lenis | null = null
  let rafId: number | null = null

  onMounted(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options,
    })

    const raf = (time: number) => {
      lenis?.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
  })

  onBeforeUnmount(() => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    lenis?.destroy()
    lenis = null
  })
}
