<script lang="ts">
  import './app.css'

  type Cell = {
    alive: boolean
    age: number
    hover: 0 | 1 | 2
  }
  type Data = Cell[][]

  let dimension = 20
  let data: Data = Array(dimension).fill(
    Array(dimension).fill({ alive: false, age: 0, hover: false })
  )
  let tickSpeed = 300

  let interval: NodeJS.Timer | null = null
  let zoom = 0.5

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
    interval = setInterval(tick, tickSpeed)
  }

  function stop() {
    if (!interval) return
    clearInterval(interval)
    interval = null
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
        ].filter((cell) => cell?.alive).length

        if (cell && (neighbors < 2 || neighbors > 3)) {
          acc.push({ alive: false, age: 0, hover: 0 })
          return acc
        }
        if (!cell.alive && neighbors === 3) {
          acc.push({ alive: true, age: cell.age + tickSpeed, hover: 0 })
          return acc
        }
        acc.push(cell)
        return acc
      }, [] as Cell[])
      acc.push(newRow)
      return acc
    }, [] as Data)
  }

  function handleClick(event: MouseEvent | KeyboardEvent) {
    if (!event.target) return

    // @ts-expect-error yes there is
    const [x, y] = event.target['dataset']?.cell.split(',').map(Number)
    console.log(x, y)
    // data[x][y] = !data[x][y]
    data = data.reduce((acc, row, i) => {
      const newRow = row.reduce((acc, cell, j) => {
        if (i === x && j === y) {
          acc.push({ alive: !cell.alive, age: 0, hover: 0 })
          return acc
        }
        acc.push(cell)
        return acc
      }, [] as Cell[])
      acc.push(newRow)
      return acc
    }, [] as Data)

    console.log(data[x][y])
    console.log(data)
  }

  let catalog = [
    {
      name: 'Glider',
      data: `
 x 
  x
xxx`,
    },
    {
      name: 'Blinker',
      data: `
 x 
 x 
 x `,
    },
    {
      name: 'Toad',
      data: `
      
      
  xxx 
 xxx  
      
      `,
    },
  ]

  let draggedData: string | null = null

  console.log(catalog)
  function dragItem(event: DragEvent, item: { name: string; data: string }) {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
    draggedData = item.data
    console.log({ item })
  }

  function dropItem(event: DragEvent, cell: [number, number]) {
    event.preventDefault()
    console.log(event.target)
    if (!draggedData) return
    // Get the id of the target and add the moved element to the target's DOM
    // const dragData = event.dataTransfer.getData('text/plain')

    const formattedData = draggedData
      .replace(/^\n/, '')
      .split('\n')
      .map((line) => line.split('').map((char) => char === 'x'))

    const [x, y] = cell

    data = data.reduce((acc, row, i) => {
      const newRow = row.reduce((acc, cell, j) => {
        const offset = Math.floor(formattedData.length / 2)
        if (
          i >= x - offset &&
          i < x + formattedData.length - offset &&
          j >= y - offset &&
          j < y + formattedData[0].length - offset
        ) {
          console.log({ i, j, x, y, formatted: formattedData })
          const validX = i - x + offset
          const validY = j - y + offset
          acc.push({
            alive: cell.alive || formattedData[validX][validY],
            age: formattedData[validX][validY] ? cell.age : 0,
            hover: 0,
          })
          return acc
        }
        acc.push(cell)
        return acc
      }, [] as Cell[])
      acc.push(newRow)
      return acc
    }, [] as Data)

    draggedData = null
  }

  function dragOver(event: DragEvent) {
    if (!event.dataTransfer) return
    if (!draggedData) {
      event.dataTransfer.dropEffect = 'none'
      // @ts-expect-error yes there is
      const [x, y] = event.target?.['dataset']?.cell.split(',').map(Number)
      data = data.reduce((acc, row, i) => {
        const newRow = row.reduce((acc, cell, j) => {
          if (i === x && j === y) {
            acc.push({ alive: true, age: cell.age, hover: 0 })
            return acc
          }
          acc.push(cell)
          return acc
        }, [] as Cell[])
        acc.push(newRow)
        return acc
      }, [] as Data)
      return
    }
    event.dataTransfer.dropEffect = 'move'

    // @ts-expect-error yes there is
    const [x, y] = event.target['dataset']?.cell.split(',').map(Number)

    const formattedData = draggedData
      .replace(/^\n/, '')
      .split('\n')
      .map((line) => line.split('').map((char) => char === 'x'))

    data = data.reduce((acc, row, i) => {
      const newRow = row.reduce((acc, cell, j) => {
        const offset = Math.floor(formattedData.length / 2)
        if (
          i >= x - offset &&
          i < x + formattedData.length - offset &&
          j >= y - offset &&
          j < y + formattedData[0].length - offset
        ) {
          const validX = i - x + offset
          const validY = j - y + offset
          acc.push({
            alive: cell.alive,
            age: cell.age,
            hover: cell.alive ? 0 : formattedData[validX][validY] ? 2 : 1,
          })
          return acc
        }
        acc.push({ alive: cell.alive, age: cell.age, hover: 0 })
        return acc
      }, [] as Cell[])
      acc.push(newRow)
      return acc
    }, [] as Data)
    event.preventDefault()
  }
</script>

<svelte:head>
  <title>Game of Life</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main
  class="flex min-h-screen w-screen items-center justify-center overflow-scroll bg-ash"
>
  <div class="fixed top-10 right-10 text-wenge">
    <h2>Catalog</h2>
    {#each catalog as item}
      <h3>{item.name}</h3>
      <div
        class="grid grid-flow-dense gap-0 hover:cursor-move "
        style={`grid-template-columns: repeat(${
          item.data.replace(/^\n/, '').split('\n').length
        }, 0fr); grid-template-rows: repeat(${
          item.data.replace(/^\n/, '').split('\n').length
        }, 0fr);`}
        on:dragstart={(event) => dragItem(event, item)}
        draggable="true"
      >
        {#each item.data.replace(/^\n/, '').split('\n') as line, i}
          {#each line.split('') as char, j}
            <div
              class="h-4 w-4 border border-wenge"
              style="background-color: {char === 'x' ? 'black' : 'white'}"
            />
          {/each}
        {/each}
      </div>
    {/each}
  </div>

  <div
    class="fixed top-10 left-10 flex w-72 flex-col gap-4 border-4 border-wenge p-4 text-wenge 2xl:w-96"
  >
    <h2 class="text-lg font-bold">Dimensions</h2>
    <input
      class="accent-amarant"
      type="range"
      step="2"
      bind:value={dimension}
      min="2"
      max="100"
    />
    <ul class="flex justify-between text-xs">
      {#each Array(11).fill(0) as _, i}
        <li>{i * 10}</li>
      {/each}
    </ul>

    <h2 class="text-lg font-bold">Tick Speed</h2>
    <input
      type="range"
      class="accent-amarant"
      step="50"
      bind:value={tickSpeed}
      min="100"
      max="1000"
      on:change={() => {
        if (interval) {
          stop()
          run()
        }
      }}
    />
    <ul class="flex justify-between text-xs">
      <li>100</li>
      <li>200</li>
      <li>300</li>
      <li>400</li>
      <li>500</li>
      <li>600</li>
      <li>700</li>
      <li>800</li>
      <li>900</li>
      <li>1000</li>
    </ul>

    <h2 class="text-lg font-bold">Zoom</h2>
    <input
      type="range"
      step="0.05"
      class="accent-amarant "
      bind:value={zoom}
      list="zoommarks"
      min="0.05"
      max="4"
    />
    <datalist id="zoommarks" class="flex justify-between text-xs">
      {#each Array(Math.round(4 / 0.5)).fill(0) as _, i}
        <option value={(i * 0.5).toFixed(2)} label={(i * 0.5).toFixed(2)} />
      {/each}
    </datalist>

    <button
      type="button"
      class="border-[3px] border-wenge bg-amarant font-bold"
      on:click={interval ? stop : run}
    >
      {interval ? 'Stop' : 'Run'}
    </button>
    <button type="button" on:click={tick}>Tick</button>
  </div>
  <div
    class={`grid w-auto grid-flow-dense gap-0 border-wenge`}
    style={`grid-template-columns: repeat(${dimension}, 0fr); grid-template-rows: repeat(${dimension}, 0fr); border-width: ${
      1 * zoom
    }px; `}
  >
    {#each data as row, i}
      {#each row as cell, j}
        <div
          data-cell={i + ',' + j}
          data-live={cell.alive}
          data-age={cell.age}
          data-hover={cell.hover}
          tabindex="0"
          class="border-wenge bg-ash hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-blue-500 data-[hover='2']:bg-blue-400 data-[hover='1']:bg-blue-200 data-[live=true]:bg-wenge"
          style={`width: ${50 * zoom}px; height: ${
            50 * zoom
          }px; border-width: ${2 * zoom}px;`}
          on:click={handleClick}
          on:keypress={handleClick}
          draggable="true"
          on:drop={(event) => dropItem(event, [i, j])}
          on:dragover={dragOver}
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
