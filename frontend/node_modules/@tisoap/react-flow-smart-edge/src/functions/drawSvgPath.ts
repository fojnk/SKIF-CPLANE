import type { XYPosition } from "@xyflow/react";

/**
 * Takes source and target {x, y} points, together with an array of number
 * tuples [x, y] representing the points along the path, and returns a string
 * to be used as the SVG path.
 */
export type SVGDrawFunction = (
  source: XYPosition,
  target: XYPosition,
  path: number[][],
) => string;

/**
 * Draws a SVG path from a list of points, using straight lines.
 */
export const svgDrawStraightLinePath: SVGDrawFunction = (
  source,
  target,
  path,
) => {
  let svgPathString = `M ${String(source.x)}, ${String(source.y)} `;

  path.forEach((point) => {
    const [x, y] = point;
    svgPathString += `L ${String(x)}, ${String(y)} `;
  });

  svgPathString += `L ${String(target.x)}, ${String(target.y)} `;

  return svgPathString;
};

/**
 * Draws a SVG path from a list of points, using rounded lines.
 */
export const svgDrawSmoothLinePath: SVGDrawFunction = (
  source,
  target,
  path,
) => {
  const points = [[source.x, source.y], ...path, [target.x, target.y]];
  return quadraticBezierCurve(points);
};

const quadraticBezierCurve = (points: number[][]) => {
  const X = 0;
  const Y = 1;
  let point = points[0];

  const first = points[0];
  let svgPath = `M${String(first[X])},${String(first[Y])}M`;

  for (const next of points) {
    const midPoint = getMidPoint(point[X], point[Y], next[X], next[Y]);

    svgPath += ` ${String(midPoint[X])},${String(midPoint[Y])}`;
    svgPath += `Q${String(next[X])},${String(next[Y])}`;
    point = next;
  }

  const last = points[points.length - 1];
  svgPath += ` ${String(last[0])},${String(last[1])}`;

  return svgPath;
};

const getMidPoint = (Ax: number, Ay: number, Bx: number, By: number) => {
  const Zx = (Ax - Bx) / 2 + Bx;
  const Zy = (Ay - By) / 2 + By;
  return [Zx, Zy];
};
