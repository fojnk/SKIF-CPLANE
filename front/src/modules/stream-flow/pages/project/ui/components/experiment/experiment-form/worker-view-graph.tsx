import { Flex, Text } from '@gravity-ui/uikit';
import { Edge, Node } from '@xyflow/react';
import React, { useEffect, useState } from 'react';

import {
  layoutGraph,
  type CubesGraphParamsWithDebug,
} from '@/modules/stream-flow/entities/cubes';
import { Graph } from '@/modules/stream-flow/shared/components/graph/experiment';

interface Props {
  graphData: CubesGraphParamsWithDebug | null;
  selectedCubeHash?: string | null;
  centerOnCubeHash?: string | null;
  onCubeClick?: (cubeHash: string | null) => void;
  onResharderClick?: () => void;
  experiment_id?: number;
}

export const WorkerViewGraph = ({
  graphData,
  selectedCubeHash,
  centerOnCubeHash,
  onCubeClick,
  onResharderClick,
  experiment_id,
}: Props) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!graphData) {
      setError('Failed to parse graph configuration');
      return;
    }

    if (graphData.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Используем ELK layout (асинхронный) для лучшего качества размещения
    layoutGraph(graphData.nodes, graphData.edges)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setError(null);
      })
      .catch((err) => {
        console.error('ELK layout failed:', err);
        setError('Failed to layout graph');
      });
  }, [graphData]);

  if (error) {
    return (
      <Flex
        style={{ width: '100%', height: '100%' }}
        alignItems="center"
        justifyContent="center"
      >
        <Text variant="body-1" color="danger">
          {error}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Graph
        nodes={nodes}
        edges={edges}
        selectedCubeHash={selectedCubeHash}
        centerOnCubeHash={centerOnCubeHash}
        onCubeClick={onCubeClick}
        onResharderClick={onResharderClick}
        experiment_id={experiment_id}
      />
    </Flex>
  );
};
