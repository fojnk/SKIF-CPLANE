import { useNodes, StraightEdge } from "@xyflow/react";
import { SmartEdge } from "../SmartEdge";
import {
  svgDrawStraightLinePath,
  pathfindingAStarDiagonal,
} from "../functions";
import type { SmartEdgeOptions } from "../SmartEdge";
import type { Edge, EdgeProps, Node } from "@xyflow/react";

const StraightConfiguration: SmartEdgeOptions = {
  drawEdge: svgDrawStraightLinePath,
  generatePath: pathfindingAStarDiagonal,
  fallback: StraightEdge,
};

export function SmartStraightEdge<
  EdgeType extends Edge = Edge,
  NodeType extends Node = Node,
>(props: EdgeProps<EdgeType>) {
  const nodes = useNodes<NodeType>();

  return (
    <SmartEdge<EdgeType, NodeType>
      {...props}
      options={StraightConfiguration}
      nodes={nodes}
    />
  );
}
