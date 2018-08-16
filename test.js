
var M = [[0, 0, 0, 0, 0],
[1, 1, 0, 0, 0],
[0, 0, 1, 1, 1],
[1, 0, 1, 1, 1],
[0, 1, 0, 0, 0]];
function zeros(dimensions) {
  var array = []
  for (var i = 0; i < dimensions[0]; ++i) {
    array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
  }
  return array;
}

function inc_adj(M) {
  n = M.length
  m = M[0].length
  var adj = zeros([n, m])

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

console.log(inc_adj(M))

function runlength(M) {
  var EM = [];
  var rows = M.length;
  var cols = M[0].length;
  var EM_size = 0, M_size = cols * rows;
  for (var line = 0; line < rows; line++) {
    var EMrow = []; var k;
    for (var col = 0; col < cols; col = k) {
      var count = 1; var val = M[line][col];
      for (k = col + 1; k < cols && M[line][k] == val; k++ , count++) { }
      EMrow.push(val); EMrow.push(count);
      EM_size += 2;
    }
    EM.push(EMrow);
  }
  return [EM, 1 - (EM_size / M_size)];
}

function sai(M) {
  vertices = M.length
  edges = M[0].length
  res = []
  for (i = 0; i < edges; i++) {
    row = []
    for (j = 0; j < vertices; j++) {
      if (M[j][i] == 1)
        row.push(j);
    }
    res.push(row)
  }
  compressed = (1 - (2 / vertices))
  return ([res, compressed]);

}

// console.log(sai(M))
