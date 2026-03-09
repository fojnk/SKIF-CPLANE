import React from 'react';

import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';

import { ProjectHeader, ProjectTabs } from './';

interface Props {
  project: ProjectInfoDC;
}

export const ProjectContent = ({ project }: Props) => {
  return (
    <>
      <ProjectHeader project={project} />
      <ProjectTabs project={project} />
    </>
  );
};
