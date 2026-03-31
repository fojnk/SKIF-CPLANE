import { useUnit } from 'effector-react';
import React from 'react';

import {
  CloneModel,
  SelectedProject,
} from '@/modules/control-plane/features/clone';
import { ProjectSelector } from '@/modules/control-plane/shared/components/selectors';
import { ProjectCatalog } from '@/modules/control-plane/shared/types';

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
