import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { projectPageModel } from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ConfigViewer } from '@/modules/control-plane/shared/components';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { ProjectInfoDC } from '@/modules/control-plane/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  dataset_id: number;
  project: ProjectInfoDC;
}

export const SchemaTab = ({ dataset_id, project }: Props) => {
  const [data, rights, load, loading, failed, editConfig] = useUnit([
    projectPageModel.dataSource.active.$data,
    projectPageModel.dataSource.active.$rights,
    projectPageModel.dataSource.active.load,
    projectPageModel.dataSource.active.$loading,
    projectPageModel.dataSource.active.$failed,
    projectPageModel.editDatasetConfig,
  ]);

  const canEdit = useMemo(
    () => (rights ?? []).includes(controlPlaneApi.dc.AclRightDC.RightEditSchema),
    [rights],
  );

  const handleReload = () => {
    load(dataset_id);
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

  if (loading || !data) {
    return <GlobalLoader absolute />;
  }

  return (
    <ConfigViewer
      data={data.schema || ''}
      onEditClick={() => {
        editConfig({
          dataSource: {
            id: data.id!,
            name: data.name!,
          },
          project: {
            id: project.id!,
            name: project.name!,
          },
          config: false,
        });
      }}
      canEdit={canEdit}
    />
  );
};
