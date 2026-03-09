import { Pipeline } from '@gravity-ui/icons';
import { Disclosure, Flex, Icon, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { SfEntityHeader } from '@/modules/stream-flow/shared/layout';
import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';
import {
  ExperimentStatus,
  EntityLabels,
} from '@/modules/stream-flow/shared/ui';

import { ExperimentActions } from './experiment-actions';
import { ExperimentUpdated } from './experiment-updates';

interface Props {
  id: number;
  name: string;
  status?: string;
  project: ProjectInfoDC;
}

export const ExperimentHeader = ({ id, name, status, project }: Props) => {
  const [expanded, setExpanded] = React.useState(false);
  const experiment = useUnit(projectPageModel.experiment.active.$data);
  return (
    <SfEntityHeader>
      <Flex direction="column" gap={3}>
        <Flex direction="row" gap={2} alignItems="center">
          <Icon
            data={Pipeline}
            size={18}
            style={{ color: 'var(--g-color-text-secondary)', marginTop: '5px' }}
          />
          <Text variant="header-2" ellipsis>
            {name}
          </Text>
          <ExperimentUpdated experiment_id={id} />
        </Flex>
        <Flex direction="row" gap={2} alignItems="center">
          <ExperimentActions id={id} name={name} project={project} />
          {status && <ExperimentStatus status={status} variant="pill" />}
          <EntityLabels id={id} />
          {experiment?.description && experiment.description !== '' && (
            <Flex style={{ marginLeft: '5px' }}>
              <Disclosure
                summary={
                  <Text
                    variant="body-1"
                    color="secondary"
                    style={{ userSelect: 'none' }}
                  >
                    Description
                  </Text>
                }
                arrowPosition="end"
                expanded={expanded}
                onUpdate={setExpanded}
              />
            </Flex>
          )}
        </Flex>
        {expanded &&
          experiment?.description &&
          experiment.description !== '' && (
            <Flex style={{ maxHeight: '200px', overflow: 'auto' }}>
              <Text
                variant="body-1"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {experiment.description}
              </Text>
            </Flex>
          )}
      </Flex>
    </SfEntityHeader>
  );
};
