import { useNodes, BezierEdge } from "@xyflow/react";
import { SmartEdge } from "../SmartEdge";
import { svgDrawSmoothLinePath, pathfindingAStarDiagonal } from "../functions";
import type { SmartEdgeOptions } from "../SmartEdge";
import type { EdgeProps, Edge, Node } from "@xyflow/react";

const BezierConfiguration: SmartEdgeOptions = {
  drawEdge: svgDrawSmoothLinePath,
  generatePath: pathfindingAStarDiagonal,
  fallback: BezierEdge,
};

export function SmartBezierEdge<
  EdgeType extends Edge = Edge,
  NodeType extends Node = Node,
>(props: EdgeProps<EdgeType>) {
  const nodes = useNodes<NodeType>();

  return (
    <SmartEdge<EdgeType, NodeType>
      {...props}
      options={BezierConfiguration}
      nodes={nodes}
    />
  );
}
