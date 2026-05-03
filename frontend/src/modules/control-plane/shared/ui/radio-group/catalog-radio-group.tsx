import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { navigationModel } from '@/modules/control-plane/features/navigation';

import styles from '@/modules/control-plane/shared/ui/segmented-glass-bar/segmented-glass-bar.module.scss';

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
    <div className={styles.bar}>
      <SegmentedRadioGroup
        className={styles.segments}
        defaultValue={active}
        onUpdate={updateHandler}
        size="l"
      >
        <SegmentedRadioGroup.Option
          value={catalogRadioGroupList.projects}
          content="Проекты"
        />
        <SegmentedRadioGroup.Option
          value={catalogRadioGroupList.dataSources}
          content="Наборы данных"
        />
        <SegmentedRadioGroup.Option
          value={catalogRadioGroupList.namespaces}
          content="Пространства"
        />
      </SegmentedRadioGroup>
    </div>
  );
};
