const LINE_LENGTH = 50;

const LINE_WIDTH = 4;

//NESW
const NESW = 0b1111; //[1,1,1,1];
const NES = 0b1110; //[1,1,1,0];
const NSW = 0b1011; //[1,0,1,1];
const NEW = 0b1101; //[1,1,0,1];
const ESW = 0b0111; //[0,1,1,1];
const ES = 0b0110; //[0,1,1,0];
const NE = 0b1100; //[1,1,0,0];
const NS = 0b1010; //[1,0,1,0];
const NW = 0b1001; //[1,0,0,1];
const SW = 0b0011; //[0,0,1,1];
const N = 0b1000; //[1,0,0,0];
const E = 0b0100; //[0,1,0,0];
const S = 0b0010; //[0,0,1,0];
const W = 0b0001; //[0,0,0,1];
const EMPTY = 0b0000; //[0,0,0,0];

//directions that can be taken for the next move
const DIRECTIONS = [
  { path: N, x: 0, y: -1 },
  { path: E, x: 1, y: 0 },
  { path: S, x: 0, y: 1 },
  { path: W, x: -1, y: 0 },
];

const MAP = [
  [ES, ESW, ESW, ESW, ESW, ESW, SW],
  [NS, NES, NESW, NESW, NESW, NESW, NSW],
  [NES, NESW, NESW, NESW, NESW, NESW, NSW],
  [NES, NSW, NE, NSW, NE, NEW, NSW],
  [NE, NESW, ESW, NESW, ESW, ESW, NSW],
  [EMPTY, NE, NEW, NEW, NEW, NEW, NW],
];

const START_NODE = { x: 1, y: 5, arrivedFrom: null };

const END_NODE = { x: 6, y: 0 };

let solutions = [];

let solutionIndex = -1;

let selectedIndex = -1;

$(function() {
  $("#next").hide();

  let ctx = $("#myCanvas").get(0).getContext("2d");

  ctx.fillStyle = "#000000";

  drawGrid(ctx);

  move(START_NODE, 0, []);

  console.log("done");

  $.each(solutions, function (index, value) {
    $("#solutions").append(
      $("<option></option>")
        .val(index)
        .html("solution - " + (index + 1) + " with " + value.length + " moves")
    );
  });

  $("#solutions").on("change", function (event) {
    ctx.clearRect(0, 0, 350, 300);

    drawGrid(ctx);

	selectedIndex = this.value;

	solutionIndex = 0;

    markNode(ctx, solutions[selectedIndex][solutionIndex]);

    $("#next").show();
  });

  $("#next").on("click", function (event) {
	  if( solutionIndex == solutions[selectedIndex].length - 1 ) {
		$("#next").hide();

		markEnd(ctx);
	  }
	  	
	  else {
		  solutionIndex++;

		  markNode(ctx, solutions[selectedIndex][solutionIndex]);
	  }

  });
});

function move(current, moves, trail) {
  //console.log( 'position - x: ' + current.x + ', y: ' + current.y + ', from: ' + current.arrivedFrom + ', moves: ' + moves );

  trail.push(current);

  let path_bitmask = MAP[current.y][current.x];

  //remove the arrival path as a candidate path, by it bitmask
  if (current.arrivedFrom != null && (path_bitmask & current.arrivedFrom) > 0)
    path_bitmask &= ~current.arrivedFrom;

  //convert the remaining bitmask into an array of directions
  let potential_directions = DIRECTIONS.filter(
    (direction) => (direction.path & path_bitmask) > 0
  );

  let potential_nodes = [];

  //create a list of nodes that can be moved to
  potential_directions.forEach((direction) =>
    potential_nodes.push(applyDirection(current, direction))
  );

  //remove nodes that have been previously visted
  potential_nodes = potential_nodes.filter(
    (node) =>
      trail.filter(
        (visited_node) => visited_node.x == node.x && visited_node.y == node.y
      ).length == 0
  );

  moves++;

  //recursively move to the next node
  if (potential_nodes.length > 0)
    potential_nodes.forEach((next_node) => {
      if (next_node.x == END_NODE.x && next_node.y == END_NODE.y) {
        console.log("found dest in " + moves + " moves");

        solutions.push(trail);
      } else move(next_node, moves, trail.slice(0, moves)); //set the trail back to
    });
  //else {
  //	console.log('dead end reached after ' + moves + ' moves' );
  //}
}

function applyDirection(current, direction) {
  return {
    x: current.x + direction.x,
    y: current.y + direction.y,
    arrivedFrom: direction.path,
  };
}

function drawGrid(ctx) {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      drawNode(ctx, { x: x, y: y }, MAP[y][x]);
    }
  }
}

function markNode(ctx, point) {
  ctx.beginPath();

  ctx.arc(
    25 + point.x * LINE_LENGTH,
    25 + point.y * LINE_LENGTH,
    10,
    0,
    2 * Math.PI,
    false
  );

  ctx.fillStyle = "green";

  ctx.fill();
}

function markEnd(ctx, point) {
	ctx.beginPath();
  
	ctx.arc(
	  25 + END_NODE.x * LINE_LENGTH,
	  25 + END_NODE.y * LINE_LENGTH,
	  10,
	  0,
	  2 * Math.PI,
	  false
	);
  
	ctx.fillStyle = "red";
  
	ctx.fill();
  }

function drawNode(ctx, coords, node) {
  if ((node & N) == N) draw(ctx, coords, "north");
  if ((node & E) == E) draw(ctx, coords, "east");
  if ((node & S) == S) draw(ctx, coords, "south");
  if ((node & W) == W) draw(ctx, coords, "west");
}

function draw(ctx, coords, type) {
  let centre = {
    x: coords.x * LINE_LENGTH + LINE_LENGTH / 2,
    y: coords.y * LINE_LENGTH + LINE_LENGTH / 2,
  };

  switch (type) {
    case "north":
      ctx.fillRect(centre.x, centre.y, 1, LINE_LENGTH / -2);
      break;

    case "east":
      ctx.fillRect(centre.x, centre.y, LINE_LENGTH / 2, 1);
      break;

    case "south":
      ctx.fillRect(centre.x, centre.y, 1, LINE_LENGTH / 2);
      break;

    case "west":
      ctx.fillRect(centre.x, centre.y, LINE_LENGTH / -2, 1);
      break;
  }
}

//https://stackoverflow.com/questions/43122082/efficiently-count-the-number-of-bits-in-an-integer-in-javascript/43122214
function countSetBits(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

//to get the opposite direction shift bit over by 2 to the right (for noth and east) or the left (for south and west)
function oppositeDirection(value) {
  switch (value) {
    case N:
    case E:
      return value >> 2;

    case S:
    case W:
      return value << 2;
  }
}
