/*
 * boilerplate
 */
const removeDuplicates = arr => arr
  .filter((item, pos, self) => self.indexOf(item) == pos)

/*
 * Initialize SVG
 */
const w = 500
const h = 400
const svg = d3.select('#graph-container')
  .append('svg')


/*
 * Handle user input
 */
function addTarget(button) {
  const targetInput = document.createElement('input')
  targetInput.type = "text"
  targetInput.classList.add('connection-input')

  button.parentNode.insertBefore(targetInput, button)
}

function addSource(button) {
  const row = document.createElement('div')
  row.classList.add('row')

  const sourceLabel = document.createElement('label')
  sourceLabel.innerHTML = "Source:"
  sourceLabel.classList.add('label')

  const sourceInput = document.createElement('input')
  sourceInput.type = "text"
  sourceInput.classList.add('connection-input')

  const targetLabel = document.createElement('label')
  targetLabel.innerHTML = "Targets:"
  targetLabel.classList.add('label')

  const firstTarget = document.createElement('input')
  firstTarget.type = "text"
  firstTarget.classList.add('connection-input')

  const plus = document.createElement('button')
  plus.classList.add('btn')
  plus.classList.add('round')
  plus.classList.add('plus')
  plus.innerText = "+"
  plus.onclick = function() { addTarget(this) }

  const col1 = document.createElement('div')
  col1.classList.add('col')
  const col2 = document.createElement('div')
  col2.classList.add('col')

  button.parentNode.parentNode.insertBefore(row, button.parentNode)
  row.appendChild(col1)
  col1.appendChild(sourceLabel)
  col1.appendChild(sourceInput)
  row.appendChild(col2)
  col2.appendChild(targetLabel)
  col2.appendChild(firstTarget)
  col2.appendChild(plus)
}

function update() {
  let nodes = []
  let edges = []
  const rows = document.querySelectorAll('.row')

  rows.forEach(row => {
    // add source to list of nodes if not already there
    const source = row.querySelectorAll('.col')[0].querySelectorAll('.connection-input')[0].value

    if (!nodes.map(n => n.id).includes(source)) {
      nodes.push({ id: source })
    }

    const inputs = row.querySelectorAll('.col')[1].querySelectorAll('.connection-input')

    inputs.forEach(input => {
      // add input to list of nodes if not already there
      if (input.value && !nodes.map(n => n.id).includes(input.value)) {
        nodes.push({ id: input.value })
      }
      // create edges to connect source to target
      const mapping = { source: source, target: input.value }
      if (source != input.value && !edges.includes(mapping)) {
        edges.push(mapping)
      }
    })
  })

  // remove empty values
  const nonNullNodes = nodes.filter(node => node.id.length)
  const nonNullEdges = edges.filter(edge => edge.source.length && edge.target.length)

  const dataset = {
    nodes: nodes,
    edges: removeDuplicates(nonNullEdges)
  }
  renderGraph(dataset)
}


function renderGraph(dataset) {
  // remove previous layers
  svg.select('#edges').remove()
  svg.select('#nodes').remove()

  const force = d3.forceSimulation(dataset.nodes)
    .force('charge', d3.forceManyBody())
    .force('link', d3.forceLink(dataset.edges).id(d => d.id))
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
    .style('fill', '#3dc21b')
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragging)
      .on('end', dragEnded)
    )

  nodes.append('title')
    .text(d => d.id)

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
