var M = [[0, 0, 0, 0, 0],
[1, 1, 0, 0, 0],
[0, 0, 1, 1, 1],
[1, 0, 1, 1, 1],
[0, 1, 0, 0, 0]];

var MR = [ [ 0, 5 ],
    [ 1, 2, 0, 3 ],
    [ 0, 2, 1, 3 ],
    [ 1, 1, 0, 1, 1, 3 ],
    [ 0, 1, 1, 1, 0, 3 ] ]

var MIL =  [ [ 1, 3 ], [ 1, 4 ], [ 2, 3 ], [ 2, 3 ], [ 2, 3 ] ]

var MDB =  [ [ 0 ], [ 3 ], [ 28 ], [ 29 ], [ 2 ] ]

function zeros(dimensions) {
  var array = []
  for (var i = 0; i < dimensions[0]; ++i) {
    array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
  }
  return array;
}

function RL_decompress(M) {
	DM = []
	n = MR.length;

	for (var i=0; i<n; ++i){
		DR = []
		for (var j=0; j<MR[i].length; j+=2){
			count = MR[i][j+1]
			val = MR[i][j]
			for (var k=0; k<count; ++k)
				DR.push(val);
		}
		DM.push(DR)
	}

	return DM;
}


function IL_decompress(M, v){


	DM = zeros([v, M.length]);
	for(var j=0; j<M.length; ++j){
		first = M[j][0];
		second = M[j][1];
		DM[first][j] = 1;
		DM[second][j] = 1;
	}

return DM;

}
function get_digits(n){
	digits = []

	for (var i=0; i<32; ++i) {
		digits.push(n%2);
		n=Math.floor(n/2);
	}
return digits;
}

function DB_decompress(M, E){

	DM = []
	for (var i=0; i<M.length; ++i) {
		DMR = []
		for(var j=0; j<M[i].length; ++j) {
			DMR.push.apply(DMR, get_digits(M[i][j]))
		}
		DMR = DMR.slice(0,E)
		DM.push(DMR)
	}
return DM
}



console.log("expected output:")
console.log(M)
console.log(RL_decompress(MR))
console.log(IL_decompress(MIL, M.length))
console.log(DB_decompress(MDB, M[0].length))