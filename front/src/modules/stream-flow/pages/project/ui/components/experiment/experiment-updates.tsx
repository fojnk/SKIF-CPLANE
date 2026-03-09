import { Label } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect } from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';

interface Props {
  experiment_id: number;
}

export const ExperimentUpdated = ({ experiment_id }: Props) => {
  const {
    load,
    $notApplied: notApplied,
    reset,
  } = useUnit(projectPageModel.experimentVersions.updates);

  useEffect(() => {
    load(experiment_id);
    return () => {
      reset();
    };
  }, [experiment_id, load, reset]);

  if (notApplied) {
    return (
      <Label theme="warning" size="s">
        Unapplied changes
      </Label>
    );
  }

  return null;
};
