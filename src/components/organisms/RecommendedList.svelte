<script>
  import CollapseButton from '../atoms/CollapseButton.svelte'
  import MunicipalityItem from '../molecules/MunicipalityItem.svelte'
  import {
    recommendedMunicipalities,
    searchQuery,
  } from '../../store/municipality'

  let open = true

  $: open = !$searchQuery.length
</script>

<style>
  section {
    border-radius: 0.75rem;
    margin: 0 0 var(--step-4);
  }

  ul {
    display: block;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  h3 {
    margin: 0;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .open {
    margin-bottom: var(--step--2);
  }
</style>

{#if $recommendedMunicipalities.length}
  <section>
    <header class:open>
      <h3>Recommended</h3>
      <CollapseButton bind:checked={open} />
    </header>
    {#if open}
      <ul>
        {#each $recommendedMunicipalities as municipality (municipality.municipality)}
          <MunicipalityItem {municipality} />
        {/each}
      </ul>
    {/if}
  </section>
{/if}
