import { Flex, Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import { useUnit } from 'effector-react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { useValue } from '@/shared/lib/react/hooks/use-value';

import { ProjectAsideDatasets } from './project-aside-datasets';
import { ProjectAsideExperiments } from './project-aside-experiments';
import { ProjectAsideHeader } from './project-aside-header';
import css from './project-aside.module.scss';

export const ProjectAside = () => {
  const [project, createExperiment, createDataset, setSelected] = useUnit([
    projectPageModel.project.current.$data,
    projectPageModel.createExperiment,
    projectPageModel.createDataset,
    projectPageModel.selected.setSelected,
  ]);
  const defaultPipe = (getFromStorage({
    type: 'local',
    key: 'pipe_disclosure',
  }) ?? true) as boolean;
  const defaultDs = (getFromStorage({
    type: 'local',
    key: 'ds_disclosure',
  }) ?? true) as boolean;

  const disclosureExperiments = useValue<boolean>(defaultPipe);
  const disclosureDatasets = useValue<boolean>(defaultDs);

  const handleNewExperiment = () => {
    if (project?.id) {
      createExperiment(project.id);
    }
  };

  const handleNewDataset = () => {
    if (project?.id) {
      createDataset(project.id);
    }
  };

  const setDsDisclosure = (extended: boolean) => {
    setToStorage({ type: 'local', key: 'ds_disclosure', value: extended });
    disclosureDatasets.set(extended);
  };

  const setPipeDisclosure = (extended: boolean) => {
    setToStorage({ type: 'local', key: 'pipe_disclosure', value: extended });
    disclosureExperiments.set(extended);
  };

  const handleDsDisclosure = (extended: boolean) => {
    setDsDisclosure(extended);
    if (!extended && !disclosureExperiments.value) {
      setPipeDisclosure(true);
    }
  };

  const handlePipeDisclosure = (extended: boolean) => {
    setPipeDisclosure(extended);
    if (!extended && !disclosureDatasets.value) {
      setDsDisclosure(true);
    }
  };

  // Проверяем права на создание источников данных и пайплайнов
  const canCreateDataset =
    project?.rights?.includes(streamFlowApi.dc.AclRightDC.RightCreateDataset) ??
    false;
  const canCreateExperiment =
    project?.rights?.includes(
      streamFlowApi.dc.AclRightDC.RightCreateExperiment,
    ) ?? false;

  const DsHeader = (
    <ProjectAsideHeader
      title="Датасеты"
      extended={disclosureDatasets.value}
      setExtended={handleDsDisclosure}
      showDisclosure
      onCreateClick={canCreateDataset ? handleNewDataset : undefined}
    />
  );
  const ExperimentHeader = (
    <ProjectAsideHeader
      title="Эксперименты"
      extended={disclosureExperiments.value}
      setExtended={handlePipeDisclosure}
      showDisclosure
      onCreateClick={canCreateExperiment ? handleNewExperiment : undefined}
    />
  );
  return (
    <Flex direction="column" className={css.aside}>
      <Flex
        direction="row"
        className={cx(css.asideHeader, css.asideBg)}
        alignItems="center"
        justifyContent="space-between"
        style={{ userSelect: 'none' }}
      >
        <Flex
          style={{
            overflow: 'hidden',
            width: '100%',
            cursor: 'pointer',
          }}
          onClick={() => setSelected(null)}
        >
          <Text
            variant="subheader-1"
            ellipsisLines={1}
            wordBreak="break-all"
            style={{ fontWeight: 'bold' }}
          >
            {project?.name}
          </Text>
        </Flex>
      </Flex>
      {!disclosureDatasets.value && DsHeader}
      {ExperimentHeader}
      {disclosureExperiments.value && (
        <Flex
          direction="column"
          className={cx(css.asideList, css.hasBottomBorder)}
        >
          <ProjectAsideExperiments />
        </Flex>
      )}
      {disclosureDatasets.value && DsHeader}
      {disclosureDatasets.value && (
        <Flex direction="column" className={css.asideList}>
          <ProjectAsideDatasets />
        </Flex>
      )}
    </Flex>
  );
};
