import { Play } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import { experimentFormModel } from '@/modules/stream-flow/entities/forms/experiment';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ConfigViewer } from '@/modules/stream-flow/shared/components';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

import { ExperimentFormViewer } from '../experiment-form';

interface Props {
  experiment_id: number;
  project: ProjectInfoDC;
}

export const ConfigTab = ({ experiment_id, project }: Props) => {
  const [applyConfig, pending, editConfig] = useUnit([
    projectPageModel.applyConfig,
    projectPageModel.$pendingExperiment,
    projectPageModel.editExperimentConfig,
  ]);

  const [data, load, loading, failed] = useUnit([
    projectPageModel.experiment.active.$data,
    projectPageModel.experiment.active.load,
    projectPageModel.experiment.active.$loading,
    projectPageModel.experiment.active.$failed,
  ]);

  const [experimentFormLoad, formLoading, formData] = useUnit([
    experimentFormModel.load,
    experimentFormModel.$loading,
    experimentFormModel.$data,
  ]);

  const [cubesLoad, cubesLoading, cubesFailed] = useUnit([
    projectPageModel.experiment.cubes.load,
    projectPageModel.experiment.cubes.$loading,
    projectPageModel.experiment.cubes.$failed,
    projectPageModel.experiment.cubes.$data,
  ]);

  useEffect(() => {
    experimentFormLoad();
    cubesLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const canEdit = useMemo(
    () =>
      (data?.rights ?? []).includes(
        streamFlowApi.dc.AclRightDC.RightEditConfig,
      ),
    [data?.rights],
  );
  const canApply = useMemo(
    () =>
      (data?.rights ?? []).includes(
        streamFlowApi.dc.AclRightDC.RightApplyExperiment,
      ),
    [data?.rights],
  );

  const handleReload = () => {
    load(experiment_id);
  };

  if (failed) {
    return (
      <ErrorMessage
        message="Не удалось загрузить данные"
        reload={handleReload}
        pending={loading}
        padding
      />
    );
  }

  if (loading || !data || formLoading || cubesLoading) {
    return <GlobalLoader absolute />;
  }

  return (
    <ConfigViewer
      data={data.config || ''}
      onEditClick={(mode) => {
        editConfig({
          experiment: {
            id: experiment_id,
            name: data.name!,
          },
          project: {
            id: project.id!,
            name: project.name!,
          },
          mode,
        });
      }}
      canEdit={canEdit}
      showCodeToggle
      configForm={
        formData &&
        !cubesFailed && (
          <ExperimentFormViewer
            formData={formData}
            config={data.config ?? ''}
            cubeConfig={data.additional_information ?? ''}
            experiment_id={experiment_id}
          />
        )
      }
      afterButtons={
        canApply && (
          <Button
            onClick={() => applyConfig({ experiment_id, name: data.name! })}
            style={{ width: 'fit-content' }}
            view="action"
            loading={pending}
          >
            <Button.Icon>
              <Play width={14} height={14} />
            </Button.Icon>
            Применить и запустить
          </Button>
        )
      }
    />
  );
};
