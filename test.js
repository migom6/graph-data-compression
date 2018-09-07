
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
  return [EM,  M_size/EM_size];
}

function binary2decimal(m){
	var i,j,sum=0,count=0,b=new Array(),li=new Array();
    var size = 0;
    x = m.length;
    y = m[0].length;
	for(i=0 ; i<x;i++){
    	var count= 0,sum =0;
        
	  for( j=0 ; j<=y; j++){
      		if(count>63 || j==y){
				li.push(sum);
  				size ++;
                //document.write(sum+ " "+j+"<br>");
					count=0,sum=0;
			}
			if(count<=63){
				sum = sum + (Math.pow(2,count) * m[i][j]);
                
                if(count==y-1)
                {
                    li.push(sum);
                    size ++;
                    break;
                }
                //sum = (sum<< 1)| (m[i][j]);
				count++;
			}

		}
		b.push(li),sum=0,count=0,li=[];
        //size++;
	}
    //document.write(size+" <br>");
    size = b[0].length*b.length;
    size = (x*y)/size;
   // document.write(size);
    return [b, size];
}



function inc_list(M) {
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
  return ([res, vertices/2]);
}

function path(G,x , y){
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




m = [[0,1,1,1],
    [1,0,1,1],
    [1,1,0,0],
    [1,1,0,0] ]


console.log(path(m , 0 , 3))


// function pathMatrix(M, d) {
//   //0 matrix
//   var temp = []
//   for(i = 0; i < d.length; i++){
//     let c = []
//     for(j = 0; j < M[0].length; j++) {
//       c.push(0)
//     }
//     temp.push(c)
//   }
//   for(i = 0; i < d.length; i++){
//     for(j = 0; j < d[i].length-1; j++){
//       x = d[i][j]
//       y = d[i][j+1]
//       for(m = 0; m < M[0].length; m++){
//         if(M[x][m] == 1 && M[x][m] == M[y][m]){
//           temp[i][m] = 1
//         }
//       }
//     }
//   }

//   return temp
// }

// m = [[1,0,0,1],
//     [1,1,0,0],
//     [0,1,1,0],
//     [0,0,1,1]]

// d = [[0,1,2],[0,3,2]]
// console.log(pathMatrix(m,d))
// console.log(inc_adj(M));
// console.log(runlength(M));
// console.log(inc_list(M));
// console.log(binary2decimal(M));


