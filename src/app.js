/*
 * Initialize SVG
 */

const w = 500
const h = 400

const colors = d3.scaleOrdinal(d3.schemeCategory10)

const svg = d3.select('#graph-container')
  .append('svg')
  .attr('width', w)
  .attr('height', h)


/*
 * Handle user input
 * TODO: distinguish input types with labels/wrappers/classes
 * // QUESTION: should adding a source and target be different?
 */
function addConnection(button) {
  // create new row with source input
  const row = document.createElement('div')
  row.classList.add('row')

  const sourceInput = document.createElement('input')
  sourceInput.type = "text"
  sourceInput.classList.add('connection-input')
  sourceInput.value = button.previousElementSibling.value

  const firstTarget = document.createElement('input')
  firstTarget.type = "text"
  firstTarget.classList.add('connection-input')

  const plus = document.createElement('button')
  plus.classList.add('round')
  plus.classList.add('plus')
  plus.innerText = "+"
  plus.onclick = function() { addConnection(this) }

  button.parentNode.parentNode.appendChild(row)
  row.appendChild(sourceInput)
  row.appendChild(firstTarget)
  row.appendChild(plus)

  // create a new target input
  const targetInput = document.createElement('input')
  targetInput.type = "text"
  targetInput.classList.add('connection-input')

  button.parentNode.insertBefore(targetInput, button)
}


function update() {
  let dataset = {
    nodes: [

    ],
    edges: [

    ]
  }
  const rows = document.querySelectorAll('.row')
  rows.forEach(row => {
    const inputs = row.querySelectorAll('.connection-input')
    const source = inputs[0].value
    inputs.forEach(input => {
      if (input.value && !dataset.nodes.map(n => n.name).includes(input.value)) {
        dataset.nodes.push({ name: input.value })
      }
      const mapping = { source: source, target: input.value }
      if (source != input.value && !dataset.edges.includes(mapping)) {
        dataset.edges.push(mapping)
      }
    })
  })
  const processed = {
    nodes: dataset.nodes,
    edges: dataset.edges.filter(edge => edge.source.length && edge.target.length)
  }
  renderGraph(processed)
}


function renderGraph(dataset) {
  svg.select('#edges').remove()
  svg.select('#nodes').remove()

  const force = d3.forceSimulation(dataset.nodes)
    .force('charge', d3.forceManyBody())
    .force('link', d3.forceLink(dataset.edges).id(d => d.name))
    .force('center', d3.forceCenter().x(w/2).y(h/2))

  const edges = svg.append('g')
    .attr('id', 'edges')
    .selectAll('line')
    .data(dataset.edges)
    .enter()
    .append('line')
    .style('stroke', '#ccc')
    .style('stroke-width', 1)

  const nodes = svg.append('g')
    .attr('id', 'nodes')
    .selectAll('circle')
    .data(dataset.nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .style('fill', (d, i) => colors(i))
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragging)
      .on('end', dragEnded)
    )

  nodes.append('title')
    .text(d => d.name)

  force.on('tick', () => {
    edges.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    nodes.attr('cx', d => d.x)
      .attr('cy', d => d.y)
  })

  function dragStarted(d) {
    if (!d3.event.active) {
      force.alphaTarget(0.3).restart()
    }
    d.fx = d.x
    d.fy = d.y
  }

  function dragging(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragEnded(d) {
    if (!d3.event.active) {
      force.alphaTarget(0)
    }
    d.fx = null
    d.fy = null
  }
}
