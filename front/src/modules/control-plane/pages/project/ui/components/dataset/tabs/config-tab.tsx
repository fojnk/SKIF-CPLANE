import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import { dsFormModel } from '@/modules/control-plane/entities/forms/dataset';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  ConfigViewer,
  ConfigFormViewer,
} from '@/modules/control-plane/shared/components';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { DatasetType, ProjectInfoDC } from '@/modules/control-plane/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  dataset_id: number;
  project: ProjectInfoDC;
}

export const ConfigTab = ({ dataset_id, project }: Props) => {
  const [data, rights, load, loading, failed, editConfig] = useUnit([
    projectPageModel.dataSource.active.$data,
    projectPageModel.dataSource.active.$rights,
    projectPageModel.dataSource.active.load,
    projectPageModel.dataSource.active.$loading,
    projectPageModel.dataSource.active.$failed,
    projectPageModel.editDatasetConfig,
  ]);

  // Формы для датасорса
  const [formCache, formLoad, formLoading] = useUnit([
    dsFormModel.$cache,
    dsFormModel.load,
    dsFormModel.$loading,
  ]);

  const canEdit = useMemo(
    () => (rights ?? []).includes(controlPlaneApi.dc.AclRightDC.RightEditConfig),
    [rights],
  );

  // Получаем параметры формы из кэша или загружаем
  const formParams = useMemo(() => {
    if (data?.type && data?.managed !== undefined) {
      const cacheKey = dsFormModel.createCacheKey(
        data.type as DatasetType,
        data.managed,
      );
      return formCache[cacheKey] || null;
    }
    return null;
  }, [data?.type, data?.managed, formCache]);

  // Загружаем параметры формы если их нет в кэше
  useEffect(() => {
    if (data?.type && data?.managed !== undefined && !formParams) {
      formLoad({
        type: data.type as DatasetType,
        managed: data.managed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  if (loading || !data || (formLoading && !formParams)) {
    return <GlobalLoader absolute />;
  }

  return (
    <ConfigViewer
      data={data.params || ''}
      onEditClick={(mode) => {
        editConfig({
          dataSource: {
            id: data.id!,
            name: data.name!,
          },
          project: {
            id: project.id!,
            name: project.name!,
          },
          config: true,
          mode,
        });
      }}
      showCodeToggle
      canEdit={canEdit}
      configForm={
        formParams ? (
          <ConfigFormViewer
            config={data.params || ''}
            formParams={formParams}
            readonly
            type="dataset"
          />
        ) : undefined
      }
    />
  );
};
