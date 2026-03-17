import { useUnit } from 'effector-react';
import React, { useEffect } from 'react';

import { projectPageModel } from '@/modules/control-plane/pages/project';
import { ErrorCard } from '@/modules/control-plane/shared/components/sf-errors';
import { DatasetDC, ProjectInfoDC } from '@/modules/control-plane/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

import { DsHeader, DsTabs } from './';

interface Props {
  ds_id: number;
  project: ProjectInfoDC;
}

export const DsContent = ({ ds_id, project }: Props) => {
  const [loading, data, load, reset] = useUnit([
    projectPageModel.dataSource.list.$loading,
    projectPageModel.dataSource.list.$data,
    projectPageModel.dataSource.active.load,
    projectPageModel.dataSource.active.reset,
  ]);
  const [loadYT, linkYT, resetYT] = useUnit([
    projectPageModel.dataSource.ytLink.load,
    projectPageModel.dataSource.ytLink.$link,
    projectPageModel.dataSource.ytLink.reset,
  ]);

  useEffect(() => {
    load(ds_id);
    loadYT(ds_id);
    return () => {
      reset();
      resetYT();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds_id]);

  if (loading && !data) {
    return <GlobalLoader absolute />;
  }

  const dataset = data?.find((ds: DatasetDC) => ds.id === ds_id);

  if (!dataset) {
    return (
      <ErrorCard
        title="Dataset Not Found"
        message={`Dataset with ID ${ds_id} was not found. It may have been deleted or you may not have access to it.`}
      />
    );
  }

  return (
    <>
      <DsHeader dataset={dataset} project={project} link={linkYT} />
      <DsTabs dataset_id={ds_id} project={project} />
    </>
  );
};
