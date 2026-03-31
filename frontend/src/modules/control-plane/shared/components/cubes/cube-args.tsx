import { ChevronDown, ChevronRight, CircleInfoFill } from '@gravity-ui/icons';
import { Flex, Icon, Text } from '@gravity-ui/uikit';
import React, { useMemo, useState } from 'react';

import { ParamsInfoPopover, ParamTypeLabel } from '../forms';

interface LongTextProps {
  variant?: 'body-1' | 'body-2' | 'caption-1' | 'caption-2';
  color?: 'primary' | 'secondary' | 'hint' | 'danger' | 'info' | 'positive';
  children: React.ReactNode;
}

const LongText = ({ variant = 'body-1', color, children }: LongTextProps) => {
  return (
    <Text
      variant={variant}
      color={color}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        minWidth: 0,
        flexShrink: 1,
      }}
    >
      {children}
    </Text>
  );
};

const EmptySection = ({ title }: { title: string }) => (
  <Flex direction="column" gap={1}>
    <Flex direction="row" gap={1} alignItems="center">
      <Text variant="subheader-1">{title}:</Text>
      <Text variant="subheader-1" color="secondary">
        empty
      </Text>
    </Flex>
  </Flex>
);

const TypeSection = ({ title, type }: { title: string; type: string }) => {
  const getColor = () => {
    if (type === 'static') return 'positive';
    if (type === 'dynamic') return 'warning';
    return 'secondary';
  };

  return (
    <Flex direction="column" gap={1}>
      <Flex direction="row" gap={1} alignItems="center">
        <Text variant="subheader-1">{title}:</Text>
        <Text variant="subheader-1" color={getColor()}>
          {type}
        </Text>
      </Flex>
    </Flex>
  );
};

interface StaticTypeSectionProps {
  title: string;
  listNames?: string[] | null;
}

const StaticTypeSection = ({ title, listNames }: StaticTypeSectionProps) => {
  const hasListNames =
    listNames && Array.isArray(listNames) && listNames.length > 0;

  return (
    <Flex direction="column" gap={1}>
      <Flex direction="row" gap={1} alignItems="center">
        <Text variant="subheader-1">{title}:</Text>
        <Text variant="subheader-1" color="positive">
          static
        </Text>
      </Flex>
      <Flex direction="column" gap={1} style={{ marginLeft: '8px' }}>
        {hasListNames ? (
          listNames.map((name, index) => (
            <Text key={index} variant="body-1" color="secondary">
              {name}
            </Text>
          ))
        ) : (
          <Text variant="body-1" color="secondary">
            empty list names
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

interface StructDisclosureProps {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const StructDisclosure = ({
  header,
  children,
  defaultExpanded = true,
}: StructDisclosureProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Flex direction="column" gap={1}>
      <Flex
        direction="row"
        alignItems="center"
        gap={1}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon
          data={expanded ? ChevronDown : ChevronRight}
          size={14}
          style={{ color: 'var(--g-color-text-hint)', flexShrink: 0 }}
        />
        {header}
      </Flex>
      {expanded && (
        <Flex direction="column" gap={1} style={{ paddingLeft: '18px' }}>
          {children}
        </Flex>
      )}
    </Flex>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderArgItem = (item: any, index: number, level: number = 0) => {
  const itemName = item?.name || `arg_${index}`;
  const itemType = item?.type?.type || 'string';
  const nestedType = item?.type?.nested_type;
  const structParams = item?.type?.struct_params;
  const oneOf = item?.one_of;
  const itemDescription = item?.description;
  const itemDefault = item?.default;
  const itemTypeConstraint = item?.type?.type_constraint;
  const isRequired = item?.required === true;
  const isStruct = itemType === 'struct' || nestedType === 'struct';
  const hasStructParams =
    isStruct &&
    structParams &&
    Array.isArray(structParams) &&
    structParams.length > 0;
  const hasOneOf = oneOf && Array.isArray(oneOf) && oneOf.length > 0;

  // Header для one_of — без label типа, с пометкой one_of
  const oneOfHeaderContent = (
    <Flex direction="row" gap={3} alignItems="center">
      <Flex
        direction="row"
        gap={0.5}
        alignItems="center"
        style={{ minWidth: 0, flexShrink: 1 }}
      >
        <LongText variant="body-1">{itemName}</LongText>
        {isRequired && (
          <Text variant="body-1" color="danger">
            *
          </Text>
        )}
        <Text variant="body-1" color="warning" style={{ marginLeft: '5px' }}>
          [one_of]
        </Text>
      </Flex>
      {(itemDescription || itemDefault !== undefined || itemTypeConstraint) && (
        <Flex direction="row" gap={1} alignItems="center">
          <ParamsInfoPopover
            description={itemDescription}
            defaultValue={itemDefault}
            typeConstraint={itemTypeConstraint}
          >
            <Icon
              data={CircleInfoFill}
              size={16}
              style={{
                color: 'var(--g-color-text-hint)',
                opacity: 0.6,
              }}
            />
          </ParamsInfoPopover>
        </Flex>
      )}
    </Flex>
  );

  // Header для обычных элементов и struct — с label типа
  const headerContent = (
    <Flex direction="row" gap={3} alignItems="center">
      <Flex
        direction="row"
        gap={0.5}
        alignItems="center"
        style={{ minWidth: 0, flexShrink: 1 }}
      >
        <LongText variant="body-1">{itemName}</LongText>
        {isRequired && (
          <Text variant="body-1" color="danger">
            *
          </Text>
        )}
      </Flex>
      <Flex direction="row" gap={1} alignItems="center">
        <ParamTypeLabel type={itemType} nestedType={nestedType} hideStruct />
        {(itemDescription ||
          itemDefault !== undefined ||
          itemTypeConstraint) && (
          <ParamsInfoPopover
            description={itemDescription}
            defaultValue={itemDefault}
            typeConstraint={itemTypeConstraint}
          >
            <Icon
              data={CircleInfoFill}
              size={16}
              style={{
                color: 'var(--g-color-text-hint)',
                opacity: 0.6,
              }}
            />
          </ParamsInfoPopover>
        )}
      </Flex>
    </Flex>
  );

  // one_of — disclosure с вариантами
  if (hasOneOf) {
    return (
      <Flex key={`${index}-${level}`} direction="column" gap={1}>
        <StructDisclosure header={oneOfHeaderContent}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {oneOf.map((oneOfItem: any, oneOfIndex: number) =>
            renderArgItem(oneOfItem, oneOfIndex, level + 1),
          )}
        </StructDisclosure>
      </Flex>
    );
  }

  // struct — disclosure с параметрами структуры
  if (hasStructParams) {
    return (
      <Flex key={`${index}-${level}`} direction="column" gap={1}>
        <StructDisclosure header={headerContent}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {structParams.map((structItem: any, structIndex: number) =>
            renderArgItem(structItem, structIndex, level + 1),
          )}
        </StructDisclosure>
      </Flex>
    );
  }

  return (
    <Flex key={`${index}-${level}`} direction="column" gap={1}>
      {headerContent}
    </Flex>
  );
};

export const CubeArgs = ({ params }: { params: string }) => {
  // Мемоизируем парсинг параметров
  const parsedParams = useMemo(() => {
    try {
      return typeof params === 'string' ? JSON.parse(params) : params;
    } catch (_error) {
      return null;
    }
  }, [params]);

  // Мемоизируем args
  const args = useMemo(() => parsedParams?.args, [parsedParams]);

  // Мемоизируем inputs
  const inputs = useMemo(() => parsedParams?.inputs, [parsedParams]);

  // Мемоизируем outputs
  const outputs = useMemo(() => parsedParams?.outputs, [parsedParams]);

  // Ранний выход при ошибке парсинга
  if (parsedParams === null) {
    return (
      <Text variant="body-1" color="danger">
        Invalid JSON format
      </Text>
    );
  }

  // Ранний выход при невалидных данных
  if (
    !parsedParams ||
    typeof parsedParams !== 'object' ||
    Array.isArray(parsedParams)
  ) {
    return (
      <Text variant="body-1" color="hint">
        No parameters to display
      </Text>
    );
  }

  const renderArgs = () => {
    if (!args || !Array.isArray(args) || args.length === 0) {
      return <EmptySection title="args" />;
    }

    return (
      <Flex direction="column" gap={1}>
        <Text variant="subheader-1">args:</Text>
        <Flex direction="column" gap={2} style={{ paddingLeft: '10px' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {args.map((item: any, index: number) =>
            renderArgItem(item, index, 0),
          )}
        </Flex>
      </Flex>
    );
  };

  const renderInputs = () => {
    if (
      !inputs ||
      typeof inputs !== 'object' ||
      Object.keys(inputs).length === 0
    ) {
      return <EmptySection title="inputs" />;
    }

    const inputType = inputs?.type;
    if (inputType === 'static') {
      return (
        <StaticTypeSection title="inputs" listNames={inputs?.list_names} />
      );
    }
    if (inputType === 'dynamic') {
      return <TypeSection title="inputs" type={inputType} />;
    }

    return (
      <Flex direction="column" gap={1}>
        <Text variant="subheader-1">inputs:</Text>
        <Flex direction="column" gap={1} style={{ paddingLeft: '10px' }}>
          {Object.keys(inputs).map((subKey) => (
            <Flex
              key={subKey}
              direction="row"
              gap={1}
              alignItems="center"
              style={{ minWidth: 0, width: '100%' }}
            >
              <LongText variant="body-1">{subKey}:</LongText>
              <LongText variant="body-1" color="hint">
                {typeof inputs[subKey] === 'object' && inputs[subKey] !== null
                  ? Array.isArray(inputs[subKey])
                    ? `Array[${inputs[subKey].length}]`
                    : 'Object'
                  : String(inputs[subKey])}
              </LongText>
            </Flex>
          ))}
        </Flex>
      </Flex>
    );
  };

  const renderOutputs = () => {
    if (
      !outputs ||
      typeof outputs !== 'object' ||
      Object.keys(outputs).length === 0
    ) {
      return <EmptySection title="outputs" />;
    }

    const outputType = outputs?.type;
    if (outputType === 'static') {
      return (
        <StaticTypeSection title="outputs" listNames={outputs?.list_names} />
      );
    }
    if (outputType === 'dynamic') {
      return <TypeSection title="outputs" type={outputType} />;
    }

    return (
      <Flex direction="column" gap={1}>
        <Text variant="subheader-1">outputs:</Text>
        <Flex direction="column" gap={1} style={{ paddingLeft: '10px' }}>
          {Object.keys(outputs).map((subKey) => (
            <Flex
              key={subKey}
              direction="row"
              gap={1}
              alignItems="center"
              style={{ marginBottom: '4px', minWidth: 0, width: '100%' }}
            >
              <LongText variant="body-1">{subKey}:</LongText>
              <LongText variant="body-1" color="hint">
                {typeof outputs[subKey] === 'object' && outputs[subKey] !== null
                  ? Array.isArray(outputs[subKey])
                    ? `Array[${outputs[subKey].length}]`
                    : 'Object'
                  : String(outputs[subKey])}
              </LongText>
            </Flex>
          ))}
        </Flex>
      </Flex>
    );
  };

  return (
    <Flex direction="column" gap={3}>
      {renderArgs()}
      {renderInputs()}
      {renderOutputs()}
    </Flex>
  );
};
