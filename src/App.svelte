<script lang="ts">
  import './app.css'
  let dimension = 10
  let data = Array(dimension).fill(Array(dimension).fill(false))

  $: {
    const diff = dimension - data.length
    if (diff > 0) {
      data = [
        ...Array(diff / 2).fill(Array(dimension).fill(false)),
        ...data.map((row) => [
          ...Array(diff / 2).fill(false),
          ...row,
          ...Array(diff / 2).fill(false),
        ]),
        ...Array(diff / 2).fill(Array(dimension).fill(false)),
      ]
    }
    if (diff < 0) {
      console.log(data)
      data = data
        .slice(-diff / 2, dimension - diff / 2)
        .map((row) => row.slice(-diff / 2, dimension - diff / 2))

      console.log(data)
    }
  }
  function run() {
    console.log('run')
  }

  function tick() {
    data = data.reduce((acc, row, i) => {
      const newRow = row.reduce((acc, cell, j) => {
        const neighbors = [
          data[i - 1]?.[j - 1],
          data[i - 1]?.[j],
          data[i - 1]?.[j + 1],
          data[i]?.[j - 1],
          data[i]?.[j + 1],
          data[i + 1]?.[j - 1],
          data[i + 1]?.[j],
          data[i + 1]?.[j + 1],
        ].filter(Boolean).length

        if (cell && (neighbors < 2 || neighbors > 3)) {
          acc.push(false)
          return acc
        }
        if (!cell && neighbors === 3) {
          acc.push(true)
          return acc
        }
        acc.push(cell)
        return acc
      }, [])
      acc.push(newRow)
      return acc
    }, [])
  }

  function handleClick(event: MouseEvent | KeyboardEvent) {
    const [x, y] = event.target['dataset'].cell.split(',').map(Number)
    console.log(x, y)
    // data[x][y] = !data[x][y]
    data = data.reduce((acc, row, i) => {
      const newRow = row.reduce((acc, cell, j) => {
        if (i === x && j === y) {
          acc.push(!cell)
          return acc
        }
        acc.push(cell)
        return acc
      }, [])
      acc.push(newRow)
      return acc
    }, [])

    console.log(data[x][y])
    console.log(data)
  }
</script>

<main
  class="flex h-screen w-screen items-center justify-center overflow-scroll"
>
  <div class="fixed top-20 left-20 flex flex-col">
    <span>number of rows {dimension}</span>
    <input type="range" step="2" bind:value={dimension} min="2" max="100" />
    <button type="button" on:click={run}>Run</button>
    <button type="button" on:click={tick}>Tick</button>
  </div>
  <div
    class={`grid w-auto grid-flow-dense gap-0`}
    style={`grid-template-columns: repeat(${dimension}, 0fr); grid-template-rows: repeat(${dimension}, 0fr);`}
  >
    {#each data as row, i}
      {#each row as cell, j}
        <div
          data-cell={i + ',' + j}
          data-live={cell}
          tabindex="0"
          class="h-16 w-16 border-2 border-slate-600 bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 data-[live=true]:bg-slate-600"
          on:click={handleClick}
          on:keypress={handleClick}
        />
      {/each}
    {/each}
  </div>
</main>
<!-- 
<style>
  .grid {
    display: grid;
  }
  input[type='range'] {
    width: 50%;
    position: fixed;
    top: 0;
    left: 0;
  }
  .cell {
    width: 50px;
    height: 50px;
    background-color: #eee;
    border: 1px solid #ccc;
  }
</style> -->
