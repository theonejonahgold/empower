import { tweened } from 'svelte/motion'
import { quintInOut } from 'svelte/easing'
import { get, writable, readable, derived } from 'svelte/store'
import { json, geoMercator, geoPath } from 'd3'

export const interact = writable(true)
export const townships = readable(new Promise(() => {}), set => {
  json('/townships.geojson').then(data => {
    set(data)
  })
})
export const width = writable(0)
export const height = writable(0)
export const projection = derived(
  [townships, width, height],
  ([$townships, $width, $height]) =>
    $townships && $width && $height
      ? geoMercator().fitSize([$width, $height], $townships)
      : null
)
export const path = derived([projection], ([$projection]) =>
  geoPath().projection($projection)
)
export const currentFocus = writable(null)
export const scale = tweened(1, {
  duration: () => (get(interact) ? 750 : 0),
  easing: quintInOut,
})
export const translate = tweened(
  {
    x: 0,
    y: 0,
  },
  {
    duration: () => (get(interact) ? 750 : 0),
    easing: quintInOut,
  }
)
