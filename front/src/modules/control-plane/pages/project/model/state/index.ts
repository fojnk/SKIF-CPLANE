import * as dataSource from './dataset';
import * as dataSourceVersions from './dataset-versions';
import * as experiment from './experiment';
import * as experimentVersions from './experiment-versions';
import * as project from './project';
import * as query from './query';
import * as selected from './selected';

const experimentTabs = {
  setActiveTab: query.setExperimentTab,
  $active: query.$activeExperimentTab,
};

const dataSourceTabs = {
  setActiveTab: query.setDatasetTab,
  $active: query.$activeDatasetTab,
};

export {
  dataSource,
  query,
  project,
  experiment,
  selected,
  experimentTabs,
  dataSourceTabs,
  experimentVersions,
  dataSourceVersions,
};
