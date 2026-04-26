// Based on https://github.com/qiao/PathFinding.js
import type { DiagonalMovement } from "./types.ts";

// A modern, typed, functional replacement for PathFinding.js Grid
// Provides the same runtime API shape used by finders/utilities:
// - width, height, nodes[][]
// - getNodeAt, isWalkableAt, setWalkableAt, getNeighbors, clone

export interface GridNode {
  x: number;
  y: number;
  walkable: boolean;
  // A* search metadata (set during pathfinding)
  costFromStart?: number;
  heuristicCostToGoal?: number;
  estimatedTotalCost?: number;
  opened?: boolean;
  closed?: boolean;
  parent?: GridNode;
}

export interface Grid {
  width: number;
  height: number;
  nodes: GridNode[][]; // nodes[row][col] i.e., nodes[y][x]

  getNodeAt: (x: number, y: number) => GridNode;
  isWalkableAt: (x: number, y: number) => boolean;
  setWalkableAt: (x: number, y: number, walkable: boolean) => void;
  getNeighbors: (
    node: GridNode,
    diagonalMovement: DiagonalMovement,
  ) => GridNode[];
  isInside: (x: number, y: number) => boolean;
  clone: () => Grid;
}

const createNodes = (
  width: number,
  height: number,
  matrix?: (number | boolean)[][],
): GridNode[][] => {
  const rows: GridNode[][] = new Array<GridNode[]>(height);
  for (let y = 0; y < height; y++) {
    const row: GridNode[] = new Array<GridNode>(width);
    for (let x = 0; x < width; x++) {
      // PathFinding.js semantics: a truthy matrix cell means non-walkable
      // (e.g., 1 indicates obstacle). Falsy (0) means walkable.
      const cell = matrix ? matrix[y]?.[x] : undefined;
      const isBlocked = !!cell;
      const walkable = matrix ? !isBlocked : true;
      row[x] = { x, y, walkable };
    }
    rows[y] = row;
  }
  return rows;
};

const withinBounds = (width: number, height: number, x: number, y: number) =>
  x >= 0 && x < width && y >= 0 && y < height;

/**
 * Create a grid with the given width/height. Optionally accepts a matrix
 * of booleans/numbers indicating obstacles (truthy = blocked, falsy/0 = walkable).
 */
export const createGrid = (
  width: number,
  height: number,
  matrix?: (number | boolean)[][],
): Grid => {
  const nodes = createNodes(width, height, matrix);

  const getNodeAt = (x: number, y: number): GridNode => nodes[y][x];

  const isWalkableAt = (x: number, y: number): boolean =>
    withinBounds(width, height, x, y) && nodes[y][x].walkable;

  const setWalkableAt = (x: number, y: number, walkable: boolean): void => {
    if (!withinBounds(width, height, x, y)) return;
    nodes[y][x].walkable = walkable;
  };

  // Diagonal movement policy using string literal union values:
  // "Always", "Never", "IfAtMostOneObstacle", "OnlyWhenNoObstacles"
  const getNeighbors = (
    node: GridNode,
    diagonalMovement: import("./types.ts").DiagonalMovement,
  ): GridNode[] => {
    const x = node.x;
    const y = node.y;
    const neighbors: GridNode[] = [];

    // ↑, →, ↓, ←
    const s0 = isWalkableAt(x, y - 1);
    const s1 = isWalkableAt(x + 1, y);
    const s2 = isWalkableAt(x, y + 1);
    const s3 = isWalkableAt(x - 1, y);

    if (s0) neighbors.push(getNodeAt(x, y - 1));
    if (s1) neighbors.push(getNodeAt(x + 1, y));
    if (s2) neighbors.push(getNodeAt(x, y + 1));
    if (s3) neighbors.push(getNodeAt(x - 1, y));

    // Diagonals: ↗, ↘, ↙, ↖
    const d0Walkable = isWalkableAt(x + 1, y - 1);
    const d1Walkable = isWalkableAt(x + 1, y + 1);
    const d2Walkable = isWalkableAt(x - 1, y + 1);
    const d3Walkable = isWalkableAt(x - 1, y - 1);

    if (diagonalMovement === "Never") {
      return neighbors;
    }

    // default: "Always"
    if (d0Walkable) neighbors.push(getNodeAt(x + 1, y - 1));
    if (d1Walkable) neighbors.push(getNodeAt(x + 1, y + 1));
    if (d2Walkable) neighbors.push(getNodeAt(x - 1, y + 1));
    if (d3Walkable) neighbors.push(getNodeAt(x - 1, y - 1));
    return neighbors;
  };

  const clone = (): Grid => {
    // Recreate the original matrix semantics: truthy = blocked
    const clonedMatrix: number[][] = nodes.map((row) =>
      row.map((node) => (node.walkable ? 0 : 1)),
    );
    return createGrid(width, height, clonedMatrix);
  };

  return {
    width,
    height,
    nodes,
    getNodeAt,
    isWalkableAt,
    setWalkableAt,
    getNeighbors,
    isInside: (x: number, y: number) => withinBounds(width, height, x, y),
    clone,
  };
};
