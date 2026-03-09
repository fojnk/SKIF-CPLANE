import { Code, Plus, ClockArrowRotateLeft } from '@gravity-ui/icons';
import {
  Button,
  Flex,
  Icon,
  SegmentedRadioGroup,
  Select,
  Label,
  Text,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState, useMemo } from 'react';

import { ExperimentVariablesModel } from '@/modules/control-plane/entities/variables/list';
import { VariableCreateModel } from '@/modules/control-plane/features/variable/create';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ExperimentVariableItem } from '@/modules/control-plane/shared/types';
import {
  getTypeTheme,
  getTypeLabel,
} from '@/modules/control-plane/shared/utils/variablesHelpers';

import { VariablesTable } from '../variables-table';
import { VariablesVersions } from '../variables-versions';

interface Props {
  experiment_id: number;
  rights?: controlPlaneApi.dc.AclRightDC[] | null;
}

export const VariablesTab = ({ experiment_id, rights }: Props) => {
  const variables = useUnit(ExperimentVariablesModel.list);
  const startCreateVariable = useUnit(VariableCreateModel.start);
  const canCreate =
    rights?.includes(controlPlaneApi.dc.AclRightDC.RightCreateVariable) ?? false;

  const [viewMode, setViewMode] = useState<'var' | 'ver'>('var');
  const [selectedVariable, setSelectedVariable] =
    useState<ExperimentVariableItem | null>(null);

  useEffect(() => {
    variables.load(experiment_id);
    return () => {
      variables.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment_id]);

  const variableOptions = useMemo(() => {
    if (!variables.$data) return [];
    return variables.$data.map((variable) => ({
      value: String(variable.id),
      content: (
        <Flex gap={2} alignItems="center" direction="row">
          <Label theme={getTypeTheme(variable.type)} size="xs">
            {getTypeLabel(variable.type)}
          </Label>
          <Text variant="body-1" ellipsisLines={1} ellipsis>
            {variable.name}
          </Text>
        </Flex>
      ),
      data: variable,
    }));
  }, [variables.$data]);

  const handleVariableSelect = (value: string[]) => {
    if (!variables.$data || value.length === 0) {
      setSelectedVariable(null);
      return;
    }
    const selected = variables.$data.find(
      (variable) => String(variable.id) === value[0],
    );
    setSelectedVariable(selected || null);
  };

  const handleShowVersions = (variable: ExperimentVariableItem) => {
    setSelectedVariable(variable);
    setViewMode('ver');
  };

  return (
    <Flex
      direction="column"
      justifyContent="flex-start"
      gapRow={3}
      style={{ width: '100%', maxWidth: '1000px' }}
    >
      <Flex direction="row" gap={2}>
        <SegmentedRadioGroup
          value={viewMode}
          onUpdate={setViewMode}
          size="m"
          width="auto"
        >
          <SegmentedRadioGroup.Option
            value="var"
            content={
              <Flex gap={1} alignItems="center">
                <Icon data={Code} size={16} /> Variables
              </Flex>
            }
          />
          <SegmentedRadioGroup.Option
            value="ver"
            content={
              <Flex gap={1} alignItems="center">
                <Icon data={ClockArrowRotateLeft} size={16} /> Versions
              </Flex>
            }
          />
        </SegmentedRadioGroup>
        {canCreate && (
          <Button
            size="m"
            onClick={() =>
              startCreateVariable({
                parent: 'experiment',
                parent_id: experiment_id,
              })
            }
            style={{ width: 'fit-content' }}
          >
            <Button.Icon>
              <Plus />
            </Button.Icon>
            New variable
          </Button>
        )}
        {viewMode === 'ver' && variableOptions.length > 0 && (
          <Select
            popupClassName="variable-select-popup"
            size="m"
            placeholder="Select a variable to filter its versions"
            value={selectedVariable ? [String(selectedVariable.id)] : []}
            onUpdate={handleVariableSelect}
            options={variableOptions}
            width="max"
            filterable
            hasClear
            renderSelectedOption={() => (
              <Flex gap={2} direction="row" alignItems="center">
                {selectedVariable && (
                  <>
                    <Label
                      theme={getTypeTheme(selectedVariable.type)}
                      size="xs"
                    >
                      {getTypeLabel(selectedVariable.type)}
                    </Label>
                    <Text variant="body-1">{selectedVariable.name}</Text>
                  </>
                )}
              </Flex>
            )}
          />
        )}
      </Flex>
      {viewMode === 'var' ? (
        <VariablesTable
          experiment_id={experiment_id}
          rights={rights}
          onShowVersions={handleShowVersions}
        />
      ) : (
        <VariablesVersions
          experiment_id={experiment_id}
          selectedVariable={selectedVariable}
          rights={rights}
        />
      )}
    </Flex>
  );
};
