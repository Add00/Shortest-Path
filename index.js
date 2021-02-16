const LINE_LENGTH = 50;

//NESW
const NESW = 0b1111; //[1,1,1,1];
const NES = 0b1110; //[1,1,1,0];
const NSW = 0b1011; //[1,0,1,1];
const NEW = 0b1101; //[1,1,0,1];
const ESW = 0b0111; //[0,1,1,1];
const ES = 0b0110; //[0,1,1,0];
const EW = 0b0110; //[0,1,0,1];
const NE = 0b1100; //[1,1,0,0];
const NS = 0b1010; //[1,0,1,0];
const NW = 0b1001; //[1,0,0,1];
const SW = 0b0011; //[0,0,1,1];
const N = 0b1000; //[1,0,0,0];
const E = 0b0100; //[0,1,0,0];
const S = 0b0010; //[0,0,1,0];
const W = 0b0001; //[0,0,0,1];
const EMPTY = 0b0000; //[0,0,0,0];

const INTERSECTIONS = [NE, ES, SW, NW];

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

$(document).ready(function () {
  let canvas_width = MAP[0].length * LINE_LENGTH;

  let canvas_height = MAP.length * LINE_LENGTH;

  let ctx = $("#myCanvas").get(0).getContext("2d");

  $("#next").hide();

  $("#myCanvas").attr("width", canvas_width + "px");

  $("#myCanvas").attr("height", canvas_height + "px");

  drawGrid(ctx);

  move(START_NODE, 0, []);

  console.log("done");

  solutions.sort((a, b) => a.length - b.length);

  $.each(solutions, function (index, value) {
    $("#solutions").append(
      $("<option></option>")
        .val(index)
        .html("solution - " + (index + 1) + " with " + value.length + " moves")
    );
  });

  $("#solutions").on("change", function (event) {
    ctx.clearRect(0, 0, canvas_width, canvas_height);

    drawGrid(ctx);

    selectedIndex = this.value;

    solutionIndex = 0;

    markNode(ctx, solutions[selectedIndex][solutionIndex]);

    $("#next").show();
  });

  $("#next").on("click", function (event) {
    if (solutionIndex == solutions[selectedIndex].length - 1) {
      $("#next").hide();

      markEnd(ctx);
    } else {
      solutionIndex++;

      markNode(ctx, solutions[selectedIndex][solutionIndex]);
    }
  });
});

function move(current, moves, trail) {
  let potential_nodes = [];

  let current_position_bitmask = MAP[current.y][current.x];

  //add the current node to the history
  trail.push(current);

  //convert the remaining bitmask into an array of directions
  let potential_directions = DIRECTIONS.filter(
    (direction) => (direction.path & current_position_bitmask) > 0
  );

  //loop through the potential directions and create a list of destination nodes
  potential_directions.forEach((direction) =>
    potential_nodes.push(applyDirection(current, direction))
  );

  //if an intersection exists filter out the straight though option otherwise
  //allow passing stright through
  if (hasIntersection(MAP[current.y][current.x]))
    potential_nodes = potential_nodes.filter(
      (node) => (node.arrivedFrom & current.arrivedFrom) == 0
    );

  //remove nodes that have been previously visted, i.e. you can't go back
  potential_nodes = potential_nodes.filter(
    (node) =>
      trail.filter(
        (visited_node) => visited_node.x == node.x && visited_node.y == node.y
      ).length == 0
  );

  moves++;

  //recursively move to the next node if available, otherwise report a dead end
  if (potential_nodes.length > 0)
    potential_nodes.forEach((next_node) => {
      //if end is in sight, then report path completed
      if (next_node.x == END_NODE.x && next_node.y == END_NODE.y) {
        console.log("found dest in " + moves + " moves");

        solutions.push(trail);
      }
      //otherwise keep moving, but we need to reset our trail
      else move(next_node, moves, trail.slice(0, moves));
    });
  else {
    console.log("dead end reached after " + moves + " moves");
  }
}

function drawGrid(ctx) {
  ctx.fillStyle = "#000000";

  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      drawNode(ctx, { x: x, y: y }, MAP[y][x], 1);
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

  drawNode(
    ctx,
    { x: point.x, y: point.y },
    oppositeDirection(point.arrivedFrom),
    5
  );
}

function markEnd(ctx) {
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

function drawNode(ctx, coords, nodes, width) {
  //draw lines in the appropriate directions for each node
  DIRECTIONS.forEach((direction) => {
    if ((nodes & direction.path) == direction.path)
      draw(ctx, coords, direction.path, width);
  });
}

function draw(ctx, coords, type, line_width) {
  let centre = {
    x: coords.x * LINE_LENGTH + LINE_LENGTH / 2,
    y: coords.y * LINE_LENGTH + LINE_LENGTH / 2,
  };

  let width_offset = line_width > 2 ? line_width / 2 : 0;

  switch (type) {
    case N:
      dims = { w: line_width, h: LINE_LENGTH / -2 };
      break;

    case E:
      dims = { w: LINE_LENGTH / 2, h: line_width };
      break;

    case S:
      dims = { w: line_width, h: LINE_LENGTH / 2 };
      break;

    case W:
      dims = { w: LINE_LENGTH / -2, h: line_width };
      break;
  }

  ctx.fillRect(
    centre.x - width_offset,
    centre.y - width_offset,
    dims.w,
    dims.h
  );
}

//https://stackoverflow.com/questions/43122082/efficiently-count-the-number-of-bits-in-an-integer-in-javascript/43122214
//not used
function countSetBits(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

function applyDirection(current, direction) {
  return {
    x: current.x + direction.x,
    y: current.y + direction.y,
    arrivedFrom: direction.path,
  };
}

//to get the opposite direction shift bit over by 2 to the right (for north and east) or the left (for south and west)
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

function hasIntersection(map_position) {
  let has_intersection = false;

  INTERSECTIONS.forEach((value) => {
    if ((map_position & value) == value) {
      has_intersection = true;

      return; //stop looping after first success
    }
  });

  return has_intersection;
}