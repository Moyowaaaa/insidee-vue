import { defineComponent, h } from 'vue'

const mark = (path: string) =>
  defineComponent({
    name: 'ToastMark',
    render() {
      return h(
        'svg',
        { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        [
          h('circle', { cx: '8', cy: '8', r: '6.2', stroke: '#333333', 'stroke-width': '1.4' }),
          h('path', {
            d: path,
            stroke: '#333333',
            'stroke-width': '1.4',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ],
      )
    },
  })

export const ToastOk = mark('M4.6 8.2 6.8 10.3 11.4 5.8')
export const ToastNo = mark('M5.4 5.4 10.6 10.6M10.6 5.4 5.4 10.6')
