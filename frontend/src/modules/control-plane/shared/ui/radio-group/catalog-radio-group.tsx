import {
  SegmentedRadioGroup,
  SegmentedRadioGroupOption,
} from '@gravity-ui/uikit';

import { navigationModel } from '@/modules/control-plane/features/navigation';

export type catalogRadioGroupProps = {
  active: catalogRadioGroupList;
};

export enum catalogRadioGroupList {
  projects = 'projects',
  namespaces = 'namespaces',
  dataSources = 'datasets',
}

export const CatalogRadioGroup = ({
  active = catalogRadioGroupList.projects,
}: catalogRadioGroupProps) => {
  const updateHandler = (value: catalogRadioGroupList) => {
    if (value === catalogRadioGroupList.projects) {
      navigationModel.projects.navigate();
    } else if (value === catalogRadioGroupList.namespaces) {
      navigationModel.namespaces.navigate();
    } else if (value === catalogRadioGroupList.dataSources) {
      navigationModel.dataSources.navigate();
    }
  };

  return (
    <SegmentedRadioGroup defaultValue={active} onUpdate={updateHandler}>
      <SegmentedRadioGroupOption
        value={catalogRadioGroupList.projects}
        content="Проекты"
      />
      <SegmentedRadioGroupOption
        value={catalogRadioGroupList.dataSources}
        content="Датасеты"
      />
      <SegmentedRadioGroupOption
        value={catalogRadioGroupList.namespaces}
        content="Рабочие пространства"
      />
    </SegmentedRadioGroup>
  );
};
