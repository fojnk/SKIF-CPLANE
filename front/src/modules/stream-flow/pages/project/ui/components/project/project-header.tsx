import { Disclosure, Flex, Text, Label } from '@gravity-ui/uikit';
import React from 'react';

import { ProjectPin } from '@/modules/stream-flow/pages/project/ui/components/project/project-pin';
import { SfEntityHeader } from '@/modules/stream-flow/shared/layout';
import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';
import { EntityLabels } from '@/modules/stream-flow/shared/ui';

import { ProjectActions } from './project-actions';

interface Props {
  project: ProjectInfoDC;
}

export const ProjectHeader = ({ project }: Props) => {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <SfEntityHeader>
      <Flex direction="column" gap={3}>
        <Flex direction="row" gap={1} alignItems="center">
          <Text variant="header-2" ellipsis>
            {project.name}
          </Text>
          <ProjectPin isPinned={project.is_pinned ?? false} id={project.id!} />
        </Flex>
        <Flex direction="row" gap={2} alignItems="center">
          <ProjectActions
            id={project.id!}
            name={project.name!}
            description={project.description}
          />
          <Label
            size="s"
            theme="clear"
            value={`${project.namespace_name}`}
            type="default"
          >
            NS
          </Label>
          <EntityLabels id={project.id!} />
          {project.description && project.description !== '' && (
            <Flex style={{ marginLeft: '5px' }}>
              <Disclosure
                summary={
                  <Text
                    variant="body-1"
                    color="secondary"
                    style={{ userSelect: 'none' }}
                  >
                    Описание
                  </Text>
                }
                arrowPosition="end"
                expanded={expanded}
                onUpdate={setExpanded}
              />
            </Flex>
          )}
        </Flex>
        {expanded && project.description && project.description !== '' && (
          <Flex style={{ maxHeight: '200px', overflow: 'auto' }}>
            <Text
              variant="body-1"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {project.description}
            </Text>
          </Flex>
        )}
      </Flex>
    </SfEntityHeader>
  );
};
