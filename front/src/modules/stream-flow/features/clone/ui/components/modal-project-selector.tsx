import { useUnit } from 'effector-react';
import React from 'react';

import {
  CloneModel,
  SelectedProject,
} from '@/modules/stream-flow/features/clone';
import { ProjectSelector } from '@/modules/stream-flow/shared/components/selectors';
import { ProjectCatalog } from '@/modules/stream-flow/shared/types';

interface Props {
  onRowClick: (project: SelectedProject) => void;
}

export const ModalProjectSelector = ({ onRowClick }: Props) => {
  const [load, loading, data, total, error, reset] = useUnit([
    CloneModel.load,
    CloneModel.$loading,
    CloneModel.$data,
    CloneModel.$total,
    CloneModel.$error,
    CloneModel.reset,
  ]);

  const handleRowClick = (project: ProjectCatalog) => {
    onRowClick({
      id: project.id!,
      name: project.name!,
    });
  };

  return (
    <ProjectSelector
      load={load}
      reset={reset}
      onRowClick={handleRowClick}
      loading={loading}
      data={data}
      error={error || undefined}
      total={total}
    />
  );
};
