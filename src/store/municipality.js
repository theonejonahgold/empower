import { readable, derived, writable } from 'svelte/store'
import { interact } from './map'
import {
  sortMunicipalitiesAlphabetically,
  sortMunicipalitiesOnProduction,
} from '../utils/sort'
import {
  filterMunicipalityOnEnergyProduction,
  filterMunicipalityOnSearchQuery,
  filterOnChosenMunicipalities,
  filterMunicipalityOnEnergyType,
} from '../utils/filter'

export const data = readable(new Promise(() => {}), set => {
  fetch(`${window.location.origin}/.netlify/functions/list`)
    .then(res => res.json())
    .then(data => set(data))
})

export const sort = writable('alphabetical')

export const filter = writable('show all')

export const searchQuery = writable('')

export const comparingMunicipalities = writable([])

comparingMunicipalities.subscribe(() => {
  searchQuery.set('')
})

export const recommendedMunicipalities = derived(
  [data, comparingMunicipalities, interact],
  ([$data, $comparingMunicipalities, $interact]) => {
    if (
      $comparingMunicipalities?.length === 0 ||
      $comparingMunicipalities?.length >= 3 ||
      !$interact
    )
      return []
    const averageTotalGeneration =
      $comparingMunicipalities.reduce(
        (acc, curr) => acc + curr.totalEnergyGeneration,
        0
      ) / $comparingMunicipalities.length
    const averageTotalArea =
      $comparingMunicipalities.reduce((acc, curr) => acc + curr.totalArea, 0) /
      $comparingMunicipalities.length
    const percentageProducingSolarEnergy =
      $comparingMunicipalities.reduce(
        (acc, curr) => (curr.solarEnergyGeneration > 0 ? acc + 1 : acc),
        0
      ) / $comparingMunicipalities.length
    const percentageProducingWindEnergy =
      $comparingMunicipalities.reduce(
        (acc, curr) => (curr.windEnergyGeneration > 0 ? acc + 1 : acc),
        0
      ) / $comparingMunicipalities.length
    const percentageProducingBiogasEnergy =
      $comparingMunicipalities.reduce(
        (acc, curr) => (curr.biogasEnergyGeneration > 0 ? acc + 1 : acc),
        0
      ) / $comparingMunicipalities.length

    const recommendations = $data
      .filter(
        d =>
          d.totalArea / averageTotalArea < 1.5 &&
          d.totalArea / averageTotalArea > 0.5
      )
      .filter(
        d =>
          d.totalEnergyGeneration / averageTotalGeneration < 1.25 &&
          d.totalEnergyGeneration / averageTotalGeneration > 0.75
      )
      .filter(
        d =>
          !$comparingMunicipalities.find(
            item => item.municipality === d.municipality
          )
      )
      .filter(
        filterMunicipalityOnEnergyType(
          'solarEnergyGeneration',
          percentageProducingSolarEnergy
        )
      )
      .filter(
        filterMunicipalityOnEnergyType(
          'windEnergyGeneration',
          percentageProducingWindEnergy
        )
      )
      .filter(
        filterMunicipalityOnEnergyType(
          'biogasEnergyGeneration',
          percentageProducingBiogasEnergy
        )
      )
      .slice(0, 3)

    return recommendations
  }
)

export const filteredData = derived(
  [data, sort, filter, searchQuery, comparingMunicipalities],
  ([$data, $sort, $filter, $searchQuery, $comparingMunicipalities]) => {
    if (!$data.length) return []
    let newData = $data
    switch ($sort) {
      case 'alphabetical':
        newData = [...newData].sort(sortMunicipalitiesAlphabetically)
        break
      case 'production-high':
        newData = [...newData].sort(sortMunicipalitiesOnProduction(true))
        break
      case 'production-low':
        newData = [...newData].sort(sortMunicipalitiesOnProduction(false))
        break
      default:
        break
    }
    switch ($filter) {
      case '0-200':
        newData = [...newData].filter(
          filterMunicipalityOnEnergyProduction(0, 200)
        )
        break
      case '200-400':
        newData = [...newData].filter(
          filterMunicipalityOnEnergyProduction(200, 400)
        )
        break
      case '400-600':
        newData = [...newData].filter(
          filterMunicipalityOnEnergyProduction(400, 600)
        )
        break
      case '600-800':
        newData = [...newData].filter(
          filterMunicipalityOnEnergyProduction(600, 800)
        )
        break
      case '800':
        newData = [...newData].filter(filterMunicipalityOnEnergyProduction(800))
        break
      default:
        break
    }
    if ($searchQuery) {
      newData = [...newData].filter(
        filterMunicipalityOnSearchQuery($searchQuery)
      )
    }
    newData = [...newData].filter(
      filterOnChosenMunicipalities($comparingMunicipalities)
    )
    return newData
  }
)
