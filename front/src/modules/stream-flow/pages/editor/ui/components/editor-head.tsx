import {
  ArrowsOppositeToDots,
  CircleCheckFill,
  CircleExclamationFill,
  Database,
  Ellipsis,
  FloppyDisk,
  LayoutSplitRows,
  Pipeline,
  TriangleExclamation,
} from '@gravity-ui/icons';
import { Button, DropdownMenu, Flex, Icon, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { DatasetValidateModel } from '@/modules/stream-flow/features/dataset/validate';
import { ShowDiffModel } from '@/modules/stream-flow/features/editor/show-diff';
import { ExperimentValidateModel } from '@/modules/stream-flow/features/experiment/validate';
import { ProjectValidateModel } from '@/modules/stream-flow/features/project/validate';
import { editorPageModel } from '@/modules/stream-flow/pages/editor';
import { onCancel } from '@/modules/stream-flow/pages/editor/model/actions';
import { FormSettingsButton } from '@/modules/stream-flow/shared/ui';

const iconMap = {
  experiment: Pipeline,
  dataset: Database,
  namespace: LayoutSplitRows,
};

const iconStyle = {
  color: 'var(--g-color-text-secondary)',
  marginTop: '2px',
};

interface EditorHeadProps {
  onSave: (disableValidation?: boolean) => void;
  afterButtons?: React.ReactNode;
}

export const EditorHead = ({ onSave, afterButtons }: EditorHeadProps) => {
  const [
    pending,
    currentConfig,
    data,
    info,
    queryParams,
    errors,
    openErrorModal,
  ] = useUnit([
    editorPageModel.loaders.$pending,
    editorPageModel.editor.$currentConfig,
    editorPageModel.editor.$data,
    editorPageModel.editor.$info,
    editorPageModel.query.$queryParams,
    editorPageModel.validator.$errors,
    editorPageModel.validator.showData,
  ]);
  const currentMode = queryParams.mode || 'code';
  const showDiff = useUnit(ShowDiffModel.start);

  const handleClose = () => {
    if (data) {
      onCancel(data);
    }
  };

  const handleShowDiff = () => {
    if (!data) return;
    showDiff({
      name: data.name,
      originalConfig: data.config || '',
      modifiedConfig: currentConfig,
    });
  };

  const handleSave = () => {
    onSave(false);
  };

  const handleSaveNoValidate = () => {
    onSave(true);
  };

  const handleValidate = () => {
    if (!data) return;

    const entityType = data.type;
    const entityId = data.id;

    if (entityType === 'project') {
      ProjectValidateModel.validateConfig(currentConfig);
    } else if (entityType === 'ds') {
      DatasetValidateModel.validateConfig(currentConfig);
    } else if (entityType === 'pipe') {
      ExperimentValidateModel.validateConfig({
        experimentConfig: currentConfig,
        experimentID: Number(entityId),
      });
    }
  };

  if (!data) return null;

  const entityType = data.type;
  const iconType =
    entityType === 'ns'
      ? 'namespace'
      : entityType === 'project'
        ? undefined
        : entityType === 'ds' || entityType === 'ds2'
          ? 'dataset'
          : entityType === 'pipe'
            ? 'experiment'
            : undefined;
  const IconComponent = iconType ? iconMap[iconType] : null;

  // Показываем dropdown с опциями валидации только для ds2, pipe, project
  const hasValidationOptions =
    entityType === 'ds' || entityType === 'pipe' || entityType === 'project';

  return (
    <Flex
      className="sf-l-pt sf-l-pr sf-l-pl"
      direction="column"
      gapRow={3}
      style={{
        paddingBottom: '18px',
        borderBottom: '1px solid var(--g-color-line-generic)',
      }}
    >
      {/* Title */}
      <Flex direction="row" alignItems="center" gap={2}>
        {IconComponent && <IconComponent style={iconStyle} />}
        <Text variant="header-1" ellipsis>
          {data.name}
        </Text>
        {info.validated && (
          <Text variant="body-1" color="positive">
            <Flex
              direction="row"
              gap={1}
              alignItems="center"
              style={{ paddingLeft: '10px' }}
            >
              <CircleCheckFill />
              Validated
            </Flex>
          </Text>
        )}
        {info.changed && !info.invalidJson && (
          <Text variant="body-1" color="warning">
            <Flex
              direction="row"
              gap={1}
              alignItems="center"
              style={{ paddingLeft: '10px' }}
            >
              <CircleExclamationFill />
              Unsaved changes
            </Flex>
          </Text>
        )}
        {info.invalidJson && (
          <Text variant="body-1" color="danger">
            <Flex
              direction="row"
              gap={1}
              alignItems="center"
              style={{ paddingLeft: '10px' }}
            >
              <CircleExclamationFill />
              invalid json
            </Flex>
          </Text>
        )}
      </Flex>

      {/* Buttons */}
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Flex direction="row" gap={2} alignItems="center">
          <Button
            view="outlined"
            size="m"
            width="auto"
            onClick={handleClose}
            disabled={pending}
          >
            Close
          </Button>
          {hasValidationOptions ? (
            <Flex direction="row" gap={0} alignItems="center">
              <Button
                view="action"
                size="m"
                width="auto"
                onClick={handleSave}
                loading={pending}
                disabled={pending || !info.changed}
                pin="round-brick"
              >
                <Button.Icon>
                  <FloppyDisk />
                </Button.Icon>
                Save changes
              </Button>
              <DropdownMenu
                renderSwitcher={(props) => (
                  <Button
                    {...props}
                    view="action"
                    size="m"
                    width="auto"
                    loading={pending}
                    disabled={pending || !info.changed}
                    pin="brick-round"
                    style={{ marginLeft: '1px' }}
                  >
                    <Icon data={Ellipsis} />
                  </Button>
                )}
                items={[
                  {
                    action: handleSave,
                    text: 'with validation',
                  },
                  {
                    action: handleSaveNoValidate,
                    text: 'disabled validation',
                  },
                ]}
              />
            </Flex>
          ) : (
            <Button
              view="action"
              size="m"
              width="auto"
              onClick={handleSave}
              loading={pending}
              disabled={pending || !info.changed}
            >
              <Button.Icon>
                <FloppyDisk />
              </Button.Icon>
              Save changes
            </Button>
          )}
          {hasValidationOptions && (
            <Button
              view="action"
              size="m"
              width="auto"
              onClick={handleValidate}
              loading={pending}
              disabled={pending}
            >
              Validate
            </Button>
          )}
          {info.changed && (
            <Button view="flat" size="m" width="auto" onClick={handleShowDiff}>
              <Button.Icon>
                <ArrowsOppositeToDots />
              </Button.Icon>
              Show Diff
            </Button>
          )}
          {errors && errors !== '' && (
            <Button view="flat" size="m" width="auto" onClick={openErrorModal}>
              <Button.Icon>
                <TriangleExclamation />
              </Button.Icon>
              Show errors
            </Button>
          )}
          {afterButtons}
        </Flex>
        {currentMode === 'form' && <FormSettingsButton />}
      </Flex>
    </Flex>
  );
};
