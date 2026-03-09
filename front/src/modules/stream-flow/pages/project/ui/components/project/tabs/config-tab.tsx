import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import { projectFormModel } from '@/modules/stream-flow/entities/forms/project';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import {
  ConfigViewer,
  ConfigFormViewer,
} from '@/modules/stream-flow/shared/components';
import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  project: ProjectInfoDC;
}

export const ConfigTab = ({ project }: Props) => {
  const editConfig = useUnit(projectPageModel.editProjectConfig);
  const projectForm = useUnit(projectFormModel);
  const canEdit = useMemo(
    () =>
      (project?.rights ?? []).includes(
        streamFlowApi.dc.AclRightDC.RightEditConfig,
      ) ?? false,
    [project],
  );

  useEffect(() => {
    projectForm.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (projectForm.$loading) {
    return <GlobalLoader absolute />;
  }

  return (
    <ConfigViewer
      data={project?.config || ''}
      onEditClick={(mode) => {
        editConfig({
          project: {
            id: project.id!,
            name: project.name!,
          },
          mode,
        });
      }}
      showCodeToggle
      canEdit={canEdit}
      configForm={
        projectForm.$data ? (
          <ConfigFormViewer
            config={project?.config || ''}
            formParams={projectForm.$data}
            readonly
            type="project"
          />
        ) : undefined
      }
    />
  );
};
