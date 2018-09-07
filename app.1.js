// set up SVG for D3

const height = document.getElementById('graph-viz').clientHeight;

const width = document.getElementById('graph-viz').clientWidth;

console.log(height, width)
// const width = 960;
// const height = 500;
const colors = d3.scaleOrdinal(d3.schemeCategory10);


const svg = d3.select('#graph-viz')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height);

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
const nodes = [
  { id: 0, reflexive: false },
  { id: 1, reflexive: true },
  { id: 2, reflexive: false },
];
var matrix;

window.onload = function(e) {
  myTable()
  swal({
    title: "Instructions!",
    text: "Click on the box to add more nodes \n\n Drag between two nodes to create an edge \n\n To delete an edge, select it with the mouse and press delete \n\n To delete a node, select it with the mouse and press delete",
    button: "Understood",
  });

}
let lastNodeId = 2;
const links = [
  { source: nodes[0], target: nodes[1], left: false, right: false },
  { source: nodes[0], target: nodes[2], left: false, right: false },
  { source: nodes[1], target: nodes[2], left: false, right: false },

];

// init D3 force layout
const force = d3.forceSimulation()
  .force('link', d3.forceLink().id((d) => d.id).distance(150))
  .force('charge', d3.forceManyBody().strength(-500))
  .force('x', d3.forceX(width / 2))
  .force('y', d3.forceY(height / 2))
  .on('tick', tick);

// init D3 drag support
const drag = d3.drag()
  .on('start', (d) => {
    if (!d3.event.active) force.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
  })
  .on('drag', (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  })
  .on('end', (d) => {
    if (!d3.event.active) force.alphaTarget(0);

    d.fx = null;
    d.fy = null;
  });

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
const dragLine = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
let path = svg.append('svg:g').selectAll('path');
let circle = svg.append('svg:g').selectAll('g');

// mouse event vars
let selectedNode = null;
let selectedLink = null;
let mousedownLink = null;
let mousedownNode = null;
let mouseupNode = null;

function resetMouseVars() {
  mousedownNode = null;
  mouseupNode = null;
  mousedownLink = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', (d) => {
    const deltaX = d.target.x - d.source.x;
    const deltaY = d.target.y - d.source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normX = deltaX / dist;
    const normY = deltaY / dist;
    const sourcePadding = d.left ? 17 : 12;
    const targetPadding = d.right ? 17 : 12;
    const sourceX = d.source.x + (sourcePadding * normX);
    const sourceY = d.source.y + (sourcePadding * normY);
    const targetX = d.target.x - (targetPadding * normX);
    const targetY = d.target.y - (targetPadding * normY);

    return `M${sourceX},${sourceY}L${targetX},${targetY}`;
  });

  circle.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', (d) => d === selectedLink)
    .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
    .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '');

  // remove old links
  path.exit().remove();

  // add new links
  path = path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', (d) => d === selectedLink)
    .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
    .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '')
    .on('mousedown', (d) => {
      if (d3.event.ctrlKey) return;

      // select link
      mousedownLink = d;
      selectedLink = (mousedownLink === selectedLink) ? null : mousedownLink;
      selectedNode = null;
      restart();
    })
    .merge(path);

  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, (d) => d.id);

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', (d) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id))
    .classed('reflexive', (d) => d.reflexive);

  // remove old nodes
  circle.exit().remove();

  // add new nodes
  const g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', (d) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id))
    .style('stroke', (d) => d3.rgb(colors(d.id)).darker().toString())
    .classed('reflexive', (d) => d.reflexive)
    .on('mouseover', function (d) {
      if (!mousedownNode || d === mousedownNode) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function (d) {
      if (!mousedownNode || d === mousedownNode) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', (d) => {
      if (d3.event.ctrlKey) return;

      // select node
      mousedownNode = d;
      selectedNode = (mousedownNode === selectedNode) ? null : mousedownNode;
      selectedLink = null;

      // reposition drag line
      dragLine
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', `M${mousedownNode.x},${mousedownNode.y}L${mousedownNode.x},${mousedownNode.y}`);

      restart();
    })
    .on('mouseup', function (d) {
      if (!mousedownNode) return;

      // needed by FF
      dragLine
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseupNode = d;
      if (mouseupNode === mousedownNode) {
        resetMouseVars();
        return;
      }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      const isRight = mousedownNode.id < mouseupNode.id;
      const source = isRight ? mousedownNode : mouseupNode;
      const target = isRight ? mouseupNode : mousedownNode;

      const link = links.filter((l) => l.source === source && l.target === target)[0];
      if (link) {
        link[isRight ? 'right' : 'left'] = false;
      } else {
        links.push({ source, target, left: false, right: false });
      }

      // select new link
      selectedLink = link;
      selectedNode = null;
      restart();
    });

  // show node IDs
  g.append('svg:text')
    .attr('x', 0)
    .attr('y', 4)
    .attr('class', 'id')
    .text((d) => d.id);

  circle = g.merge(circle);

  // set the graph in motion
  force
    .nodes(nodes)
    .force('link').links(links);

  force.alphaTarget(0.3).restart();
}

function mousedown() {
  // because :active only works in WebKit?
  svg.classed('active', true);

  if (d3.event.ctrlKey || mousedownNode || mousedownLink) return;

  // insert new node at point
  const point = d3.mouse(this);
  const node = { id: ++lastNodeId, reflexive: false, x: point[0], y: point[1] };
  nodes.push(node);

  restart();
}

function mousemove() {
  if (!mousedownNode) return;

  // update drag line
  dragLine.attr('d', `M${mousedownNode.x},${mousedownNode.y}L${d3.mouse(this)[0]},${d3.mouse(this)[1]}`);

  restart();
}

function createMatrix(nodes, links){
  if(nodes.length == 0 || links.length ==0)
    return("cant create")
  M = []
  for(i = 0; i < nodes.length; i++){
    row = []
    for(j = 0; j < links.length; j++){
      row.push(0)
    }
    M.push(row)
  }
  for(i =0; i < links.length; i++){
    x = links[i].source.id
    y = links[i].target.id
    M[x][i] = 1
    M[y][i] = 1
  }
  return M
}


function makeTableHTML(myArray) {
  var result = "<table>";
  for(var i=0; i<myArray.length; i++) {
      result += "<tr>";
      for(var j=0; j<myArray[i].length; j++){
          result += "<td>"+myArray[i][j]+"</td>";
      }
      result += "</tr>";
  }
  result += "</table>";

  return result;
}

function myTable() {
  M = createMatrix(nodes, links)

  res = makeTableHTML(M)
  document.getElementById('myTable').innerHTML = res
}

function mouseup() {
  if (mousedownNode) {
    // hide drag line
    dragLine
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  myTable()

  resetMouseVars();
}






function spliceLinksForNode(node) {
  const toSplice = links.filter((l) => l.source === node || l.target === node);
  for (const l of toSplice) {
    links.splice(links.indexOf(l), 1);
  }
}

// only respond once per keydown
let lastKeyDown = -1;

function keydown() {
  d3.event.preventDefault();

  if (lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if (d3.event.keyCode === 17) {
    circle.call(drag);
    svg.classed('ctrl', true);
  }

  if (!selectedNode && !selectedLink) return;

  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if (selectedNode) {
        nodes.splice(nodes.indexOf(selectedNode), 1);
        spliceLinksForNode(selectedNode);
        myTable()
      } else if (selectedLink) {
        links.splice(links.indexOf(selectedLink), 1);
        myTable()
      }
      selectedLink = null;
      selectedNode = null;
      restart();
      break;
    case 66: // B
      if (selectedLink) {
        // set link direction to both left and right
        selectedLink.left = true;
        selectedLink.right = true;
      }
      restart();
      break;
    case 76: // L
      if (selectedLink) {
        // set link direction to left only
        selectedLink.left = true;
        selectedLink.right = false;
      }
      restart();
      break;
    case 82: // R
      if (selectedNode) {
        // toggle node reflexivity
        selectedNode.reflexive = !selectedNode.reflexive;
      } else if (selectedLink) {
        // set link direction to right only
        selectedLink.left = false;
        selectedLink.right = true;
      }
      restart();
      break;
  }
}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if (d3.event.keyCode === 17) {
    circle.on('.drag', null);
    svg.classed('ctrl', false);
  }
}

function paths(G,x , y){
  var visited = []
  for(i=0;i<G.length;i++)
    visited.push(0);
  
  sol = []
  c = 0
  arr = []
  function DFS(i , y) {
    arr.push(i);
    visited[i] = 1;
    if(i == y) {
      let b = Array.from(arr);
      sol.push(b)
      visited[i] = 0;
      arr.pop()
      return;
    }
    var j;
    for(j = 0; j < G.length; j++){
      if(visited[j] != 1 && G[i][j]==1)
            DFS(j, y);
    }   
    visited[i]=0;
    arr.pop()
    return 
    //c = c + 1
    // if(c == G.length - 1){
    //   return
    // }
  }

  DFS(x , y)
  return sol
}


function pathMatrix(M, d) {
  //0 matrix
  var temp = []
  for(i = 0; i < d.length; i++){
    let c = []
    for(j = 0; j < M[0].length; j++) {
      c.push(0)
    }
    temp.push(c)
  }
  for(i = 0; i < d.length; i++){
    for(j = 0; j < d[i].length-1; j++){
      x = d[i][j]
      y = d[i][j+1]
      for(m = 0; m < M[0].length; m++){
        if(M[x][m] == 1 && M[x][m] == M[y][m]){
          temp[i][m] = 1
        }
      }
    }
  }

  return temp
}
function inc_adj(M) {
  n = M.length
  m = M[0].length
  var adj = zeros([n, n])

  for (var j = 0; j < m; ++j) {
    var edj = []
    for (var i = 0; i < n; ++i) {
      if(M[i][j] == 1)
        edj.push(i)
    }
    adj[edj[0]][edj[1]] = 1
    adj[edj[1]][edj[0]] = 1
  }
  return adj
}
function zeros(dimensions) {
  var array = []
  for (var i = 0; i < dimensions[0]; ++i) {
    array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
  }
  return array;
}
function pathMatrixTable () {
  src = document.getElementById("inp1").value;
  des = document.getElementById("inp2").value;
  M = createMatrix(nodes, links)
  M1 = inc_adj(M)
  K = paths(M1,Number(src-1),Number(des-1))
  console.log(K)
  k = pathMatrix(M, K)
  res = makeTableHTML(k)
  document.getElementById('pathtable').innerHTML = res
}

function pathdirection() {
  document.getElementById('pathvector').innerHTML = ''

  M = createMatrix(nodes, links)
  src = document.getElementById("inp1").value;
  des = document.getElementById("inp2").value;
  M1 = inc_adj(M)
  K = paths(M1,Number(src-1),Number(des-1))
  s = ''
  for(i = 0; i < K.length; i++){
    for(j = 0; j < K[i].length; j++){
      s = s + K[i][j] +' ' + '-> '
    }
    s = s.slice(0,-2)
    var e = document.createElement('span');
    e.innerHTML = s
    document.getElementById('pathvector').appendChild(e)
    var e = document.createElement('br');

    document.getElementById('pathvector').appendChild(e)
    s = ''
  }

}

// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();






