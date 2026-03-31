import { ArrowRotateRight } from '@gravity-ui/icons';
import { Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import {
  buildProjectGraph,
  type ExperimentNodeData,
} from '@/modules/control-plane/entities/projects/graph';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import { ProjectGraph } from '@/modules/control-plane/shared/components/graph/project';
import { ButtonWithProgress } from '@/modules/control-plane/shared/ui';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  project_id: number;
}

export const ContentTab = ({ project_id }: Props) => {
  const [loading, nodes, load, reset, setExperiment, selectedExperimentId] =
    useUnit([
      projectPageModel.experiment.graph.$loading,
      projectPageModel.experiment.graph.$data,
      projectPageModel.experiment.graph.load,
      projectPageModel.experiment.graph.reset,
      projectPageModel.selected.setExperiment,
      projectPageModel.selected.$selectedExperimentId,
    ]);

  useEffect(() => {
    load(project_id);

    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project_id]);

  const handleManualRefresh = React.useCallback(() => {
    load(project_id);
  }, [load, project_id]);

  // Строим граф через новые утилиты
  const graph = useMemo(() => {
    return buildProjectGraph(nodes ?? []);
  }, [nodes]);

  // Обработчик клика по ноде
  const handleNodeClick = React.useCallback(
    (
      nodeId: string | null,
      nodeType: 'experiment' | 'dataset',
      nodeData: ExperimentNodeData,
    ) => {
      if (nodeId && nodeType === 'experiment') {
        setExperiment({ id: nodeData.id, name: nodeData.label ?? '' });
      }
    },
    [setExperiment],
  );

  // Сброс выделения при клике на пустое место
  const handlePaneClick = React.useCallback(() => {
    // При желании можно сбросить выбранный experiment
  }, []);

  // Формируем ID выбранной ноды
  const selectedNodeId = selectedExperimentId
    ? `experiment-${selectedExperimentId}`
    : null;

  if (loading && nodes === null) {
    return <GlobalLoader absolute />;
  }

  return (
    <Flex style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Flex
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 2,
        }}
      >
        <ButtonWithProgress
          view="normal"
          size="m"
          loading={loading}
          onClick={handleManualRefresh}
          intervalMs={10000}
          style={{
            backgroundColor: 'var(--g-color-base-float)',
            boxShadow: '0 2px 6px 0 var(--g-color-sfx-shadow)',
          }}
        >
          <ButtonWithProgress.Icon>
            <ArrowRotateRight />
          </ButtonWithProgress.Icon>
          Refresh
        </ButtonWithProgress>
      </Flex>
      <ProjectGraph
        nodes={graph.nodes}
        edges={graph.edges}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
      />
    </Flex>
  );
};
