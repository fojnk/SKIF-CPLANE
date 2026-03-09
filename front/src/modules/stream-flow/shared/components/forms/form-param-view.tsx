import { ChevronDown, ChevronRight, CircleInfoFill } from '@gravity-ui/icons';
import { ClipboardButton, Flex, Icon, Text, Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  getMonacoLanguage,
  isMultilineConstraint,
} from '@/modules/stream-flow/entities/monaco-editor';
import { CustomParamModel } from '@/modules/stream-flow/features/custom-param';
import { MultilineEditorModel } from '@/modules/stream-flow/features/monaco/multiline-editor';
import {
  ParamsStringTypeDC,
  ParamsTypeConstraintDC,
} from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import { ParamsDC } from '@/modules/stream-flow/shared/types';

import css from './form-param-view.module.scss';
import { ParamDisclosure, ParamsInfoPopover, ParamTypeLabel } from './ui';

// ============================================================================
// Context для настроек FormParamView
// ============================================================================

interface FormParamViewContextValue {
  /** Раскрыты ли вложенные disclosure по умолчанию */
  defaultExpanded: boolean;
  /** Имя параметра, который должен быть раскрыт (остальные закрыты) */
  focusedParam?: string | null;
  /** Список имён доступных переменных для подсветки ${variableName} */
  variableNames?: string[];
  /** Callback при клике на переменную */
  onVariableClick?: (variableName: string) => void;
}

const FormParamViewContext = createContext<FormParamViewContextValue>({
  defaultExpanded: false,
  focusedParam: null,
  variableNames: undefined,
  onVariableClick: undefined,
});

const useFormParamViewContext = () => useContext(FormParamViewContext);

// ============================================================================
// Типы
// ============================================================================

// Используем ParamsTypeConstraintDC из data-contracts
type TypeConstraint = ParamsTypeConstraintDC;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParamValue = any;

interface FormParamViewProps {
  params: ParamsDC[];
  values: Record<string, ParamValue>;
  level?: number;
  /** Использовать disclosure для сложных типов на первом уровне */
  disclosure?: boolean;
  /** Раскрыт ли disclosure первого уровня по умолчанию */
  defaultOpen?: boolean;
  /** Раскрыты ли вложенные disclosure (2+ уровень) по умолчанию (по умолчанию false — закрыты) */
  defaultExpanded?: boolean;
  /** Имя параметра, который должен быть раскрыт (остальные закрыты) */
  focusedParam?: string | null;
  /** Список имён доступных переменных для подсветки ${variableName} */
  variableNames?: string[];
  /** Callback при клике на переменную */
  onVariableClick?: (variableName: string) => void;
}

// ============================================================================
// Вспомогательные функции для проверки пустых значений
// ============================================================================

const isEmpty = (value: ParamValue): boolean => {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
};

const isStructEmpty = (
  value: ParamValue,
  structParams?: ParamsDC[],
): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return isEmpty(value);
  }

  if (!structParams || structParams.length === 0) {
    return Object.keys(value).length === 0;
  }

  return structParams.every((param) => {
    // Для one_of параметров значения хранятся под именами вариантов, а не под именем параметра
    // ВАЖНО: для one_of вариант считается выбранным если он присутствует в объекте,
    // даже если значение пустое ({}, [])
    if (param.one_of && param.one_of.length > 0) {
      // Проверяем, есть ли хотя бы один выбранный вариант (присутствует в объекте)
      const hasSelectedVariant = param.one_of.some((variant) => {
        const variantName = variant.name || '';
        // Вариант выбран если ключ присутствует в объекте (даже если значение пустое)
        return (
          variantName in value &&
          value[variantName] !== undefined &&
          value[variantName] !== null
        );
      });
      // Если есть выбранный вариант — структура не пустая
      return !hasSelectedVariant;
    }

    const fieldValue = value[param.name || ''];
    const paramType = param.type?.type;

    if (paramType === 'struct') {
      return isStructEmpty(fieldValue, param.type?.struct_params);
    }

    if (
      paramType === 'array' &&
      param.type?.nested_type === 'struct' &&
      Array.isArray(fieldValue)
    ) {
      return (
        fieldValue.length === 0 ||
        fieldValue.every((item) =>
          isStructEmpty(item, param.type?.struct_params),
        )
      );
    }

    return isEmpty(fieldValue);
  });
};

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

interface FieldLabelProps {
  name: string;
  required?: boolean;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  typeConstraint?: TypeConstraint;
  type?: string;
  nestedType?: string;
}

const FieldLabel: React.FC<FieldLabelProps> = ({
  name,
  required,
  description,
  defaultValue,
  typeConstraint,
  type,
  nestedType,
}) => (
  <Flex
    direction="row"
    gap={1}
    alignItems="center"
    justifyContent="space-between"
    style={{ width: '100%', marginBottom: '4px' }}
  >
    <Flex
      direction="row"
      gap={1}
      alignItems="center"
      style={{ minWidth: 0, flex: 1 }}
    >
      <Flex direction="row" alignItems="center" gap={0} style={{ minWidth: 0 }}>
        <Text
          variant="body-1"
          ellipsis
          style={{ opacity: 0.8, fontWeight: 400 }}
        >
          {name}
        </Text>
        {required && (
          <Text
            color="danger"
            variant="body-1"
            style={{ flexShrink: 0, marginLeft: '2px' }}
          >
            *
          </Text>
        )}
      </Flex>
      {(description || defaultValue !== undefined || typeConstraint) && (
        <ParamsInfoPopover
          description={description}
          defaultValue={defaultValue}
          typeConstraint={typeConstraint}
        >
          <Icon
            data={CircleInfoFill}
            size={14}
            style={{
              color: 'var(--g-color-text-hint)',
              opacity: 0.6,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
        </ParamsInfoPopover>
      )}
    </Flex>
    {type && <ParamTypeLabel type={type} nestedType={nestedType} />}
  </Flex>
);

// ============================================================================
// Компонент сворачивания с иконкой слева (для структур 2+ уровня и массивов)
// ============================================================================

interface FieldDisclosureProps {
  name: string;
  required?: boolean;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  typeConstraint?: TypeConstraint;
  type?: string;
  nestedType?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  /** Счётчик элементов (для массивов, kv, структур) */
  itemsCount?: number;
}

const FieldDisclosure: React.FC<FieldDisclosureProps> = ({
  name,
  required,
  description,
  defaultValue,
  typeConstraint,
  type,
  nestedType,
  children,
  defaultExpanded = false,
  itemsCount,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Flex direction="column" gap={1}>
      <Flex
        direction="row"
        alignItems="center"
        gap={1}
        style={{ cursor: 'pointer', userSelect: 'none', minWidth: 0 }}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon
          data={expanded ? ChevronDown : ChevronRight}
          size={14}
          style={{ color: 'var(--g-color-text-hint)', flexShrink: 0 }}
        />
        <Flex
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="space-between"
          style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
        >
          <Flex
            direction="row"
            gap={1}
            alignItems="center"
            style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}
          >
            <Text
              variant="body-1"
              ellipsis
              style={{ opacity: 0.9, fontWeight: 600, minWidth: 0 }}
            >
              {name}
            </Text>
            {required && (
              <Text color="danger" variant="body-1" style={{ flexShrink: 0 }}>
                *
              </Text>
            )}
            {!expanded && itemsCount !== undefined && (
              <Text
                variant="body-1"
                color="secondary"
                style={{ flexShrink: 0, marginLeft: '4px' }}
              >
                {itemsCount}
              </Text>
            )}
            {(description || defaultValue !== undefined || typeConstraint) && (
              <ParamsInfoPopover
                description={description}
                defaultValue={defaultValue}
                typeConstraint={typeConstraint}
              >
                <Icon
                  data={CircleInfoFill}
                  size={14}
                  style={{
                    color: 'var(--g-color-text-hint)',
                    opacity: 0.6,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
              </ParamsInfoPopover>
            )}
          </Flex>
          {type && <ParamTypeLabel type={type} nestedType={nestedType} />}
        </Flex>
      </Flex>
      {expanded && (
        <Flex direction="column" gap={2} style={{ paddingLeft: '18px' }}>
          {children}
        </Flex>
      )}
    </Flex>
  );
};

// ============================================================================
// Утилиты для работы с переменными ${variableName}
// ============================================================================

/** Регулярное выражение для поиска переменных ${variableName} */
const VARIABLE_PATTERN = /(\$\{([^}]+)\})/g;

/**
 * Разбивает строку на части: обычный текст и переменные
 */
const parseVariables = (
  value: string,
): Array<{ type: 'text' | 'variable'; content: string; name?: string }> => {
  if (!value) return [];

  const parts: Array<{
    type: 'text' | 'variable';
    content: string;
    name?: string;
  }> = [];
  let lastIndex = 0;

  VARIABLE_PATTERN.lastIndex = 0;
  let match;

  while ((match = VARIABLE_PATTERN.exec(value)) !== null) {
    // Добавляем текст до переменной
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: value.slice(lastIndex, match.index),
      });
    }

    // Добавляем переменную
    parts.push({
      type: 'variable',
      content: match[1], // ${variableName}
      name: match[2], // variableName
    });

    lastIndex = match.index + match[0].length;
  }

  // Добавляем оставшийся текст
  if (lastIndex < value.length) {
    parts.push({
      type: 'text',
      content: value.slice(lastIndex),
    });
  }

  return parts;
};

// ============================================================================
// Компоненты для отображения примитивных типов
// ============================================================================

/**
 * Компонент для отображения текста с подсветкой переменных
 */
const TextWithVariables: React.FC<{ value: string }> = ({ value }) => {
  const { variableNames, onVariableClick } = useFormParamViewContext();

  // Если нет списка переменных — просто выводим текст
  if (!variableNames || variableNames.length === 0) {
    return <>{value}</>;
  }

  const parts = parseVariables(value);

  // Если нет переменных в тексте — просто выводим текст
  if (parts.length === 0 || parts.every((p) => p.type === 'text')) {
    return <>{value}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <React.Fragment key={index}>{part.content}</React.Fragment>;
        }

        // Это переменная — проверяем, есть ли она в списке
        const isKnown = part.name && variableNames.includes(part.name);

        if (isKnown && onVariableClick && part.name) {
          const varName = part.name;
          return (
            <Text
              key={index}
              as="span"
              color="info"
              style={{
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onVariableClick(varName);
              }}
            >
              {part.content}
            </Text>
          );
        }

        // Неизвестная переменная — выводим как есть
        return (
          <Text key={index} as="span" color="secondary">
            {part.content}
          </Text>
        );
      })}
    </>
  );
};

export const ValueText: React.FC<{ value?: string }> = ({ value }) => {
  const { variableNames } = useFormParamViewContext();
  const hasVariables = variableNames && variableNames.length > 0;

  return (
    <Flex
      direction="column"
      alignItems="flex-start"
      gap={1}
      style={{ width: '100%', position: 'relative' }}
    >
      <Text
        color="primary"
        wordBreak="break-all"
        whiteSpace="break-spaces"
        className={css.valueBox}
        variant="body-1"
        style={{ fontWeight: 400 }}
      >
        {hasVariables && value ? <TextWithVariables value={value} /> : value}
      </Text>
      <ClipboardButton
        text={value ?? ''}
        size="xs"
        view="flat-secondary"
        style={{ position: 'absolute', right: '3px', top: '3px' }}
      />
    </Flex>
  );
};

/**
 * Компонент для отображения custom параметра с кнопкой View
 */
const CustomParamValueView: React.FC<{ paramName: string; value: string }> = ({
  paramName,
  value,
}) => {
  const { variableNames } = useFormParamViewContext();
  const openModal = useUnit(CustomParamModel.start);
  const hasVariables = variableNames && variableNames.length > 0;

  // Проверяем, является ли значение только переменной (например ${myVar})
  const isOnlyVariable = value && /^\$\{[^}]+\}$/.test(value.trim());

  const handleView = () => {
    openModal({
      paramName,
      value,
      mode: 'view',
    });
  };

  return (
    <Flex
      direction="column"
      alignItems="flex-start"
      gap={1}
      style={{ width: '100%', position: 'relative' }}
    >
      {!isOnlyVariable && (
        <Button view="flat-action" size="xs" onClick={handleView}>
          Show in dialog window
        </Button>
      )}
      <Text
        color="primary"
        wordBreak="break-all"
        whiteSpace="break-spaces"
        className={css.valueBox}
        variant="body-1"
        style={{ fontWeight: 400 }}
      >
        {hasVariables && value ? <TextWithVariables value={value} /> : value}
      </Text>
      <ClipboardButton
        text={value ?? ''}
        size="xs"
        view="flat-secondary"
        style={{ position: 'absolute', right: '3px', top: '3px' }}
      />
    </Flex>
  );
};

/**
 * Компонент для отображения multiline параметра с кнопкой Show in modal
 */
const MultilineValueView: React.FC<{
  paramName: string;
  value: string;
  constraintType?: ParamsStringTypeDC | 'yaml';
}> = ({ paramName, value, constraintType }) => {
  const { variableNames } = useFormParamViewContext();
  const openModal = useUnit(MultilineEditorModel.start);
  const hasVariables = variableNames && variableNames.length > 0;

  // Проверяем, является ли значение только переменной (например ${myVar})
  const isOnlyVariable = value && /^\$\{[^}]+\}$/.test(value.trim());

  const handleView = () => {
    openModal({
      paramName,
      value,
      language: getMonacoLanguage(constraintType),
      // Не передаём onSave - значит режим просмотра
    });
  };

  return (
    <Flex direction="column" gap={1} alignItems="flex-start">
      {!isOnlyVariable && (
        <Flex
          direction="row"
          gap={2}
          justifyContent="space-between"
          style={{ width: '100%' }}
        >
          <Button view="flat-action" size="xs" onClick={handleView}>
            Show in modal
          </Button>

          <ClipboardButton text={value ?? ''} size="xs" view="flat-secondary" />
        </Flex>
      )}
      <Text
        color="primary"
        wordBreak="break-all"
        whiteSpace="break-spaces"
        className={css.valueBox}
        variant="body-1"
        style={{
          fontWeight: 400,
          maxHeight: '160px',
          overflow: 'auto',
          width: '100%',
        }}
      >
        {hasVariables && value ? <TextWithVariables value={value} /> : value}
      </Text>
    </Flex>
  );
};

const ValueBoolean: React.FC<{ value?: boolean }> = ({ value }) => (
  <Flex
    direction="row"
    justifyContent="space-between"
    gap={1}
    style={{ width: '100%', position: 'relative' }}
  >
    <Text
      color={value ? 'positive' : 'danger'}
      wordBreak="break-all"
      whiteSpace="break-spaces"
      className={css.valueBox}
      variant="body-1"
      style={{ fontWeight: 400 }}
    >
      {value !== undefined ? (value ? 'True' : 'False') : ''}
    </Text>
  </Flex>
);

const ValueNumber: React.FC<{ value?: number | string }> = ({ value }) => {
  const { variableNames } = useFormParamViewContext();
  const strValue = value !== undefined ? String(value) : '';
  const hasVariables = variableNames && variableNames.length > 0;

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      gap={1}
      style={{ width: '100%', position: 'relative' }}
    >
      <Text
        color="primary"
        wordBreak="break-all"
        whiteSpace="break-spaces"
        className={css.valueBox}
        variant="body-1"
        style={{ fontWeight: 400 }}
      >
        {hasVariables && strValue ? (
          <TextWithVariables value={strValue} />
        ) : (
          strValue
        )}
      </Text>
      <ClipboardButton
        text={strValue}
        size="xs"
        view="flat-secondary"
        style={{ position: 'absolute', right: '3px', top: '3px' }}
      />
    </Flex>
  );
};

const EmptyValue: React.FC<{ message?: string }> = ({ message = 'Empty' }) => (
  <Text variant="body-1" color="secondary" style={{ fontWeight: 600 }}>
    {message}
  </Text>
);

// ============================================================================
// Вспомогательная функция для рендеринга примитивов
// ============================================================================

const renderPrimitiveValue = (
  value: ParamValue,
  type: string,
): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <EmptyValue />;
  }

  switch (type) {
    case 'boolean': {
      let boolValue: boolean | undefined;
      if (value === 'true' || value === true) {
        boolValue = true;
      } else if (value === 'false' || value === false) {
        boolValue = false;
      } else {
        boolValue = undefined;
      }
      return <ValueBoolean value={boolValue} />;
    }
    case 'integer':
    case 'double':
      return <ValueNumber value={value as number} />;
    case 'string':
    default:
      return <ValueText value={String(value)} />;
  }
};

// ============================================================================
// Компонент для отображения массива
// ============================================================================

interface ParamArrayViewProps {
  values: ParamValue[];
  nestedType: string;
}

const ParamArrayView: React.FC<ParamArrayViewProps> = ({
  values,
  nestedType,
}) => {
  if (!Array.isArray(values) || values.length === 0) {
    return <EmptyValue message="Empty array" />;
  }

  return (
    <Flex direction="column" gap={2}>
      {values.map((item, index) => (
        <React.Fragment key={index}>
          {renderPrimitiveValue(item, nestedType)}
        </React.Fragment>
      ))}
    </Flex>
  );
};

// ============================================================================
// Компонент для отображения Key-Value
// ============================================================================

interface ParamKVViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  nestedType?: string;
  structParams?: ParamsDC[];
  level?: number;
}

// Компонент для одного элемента KV со структурой (со сворачиванием)
interface KVStructItemViewProps {
  keyName: string;
  structParams: ParamsDC[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>;
  level: number;
  defaultExpanded?: boolean;
}

const KVStructItemView: React.FC<KVStructItemViewProps> = ({
  keyName,
  structParams,
  value,
  level,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Flex
      direction="column"
      gap={0}
      style={{
        border: '1px dashed var(--g-color-line-generic)',
      }}
    >
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        style={{
          padding: '6px 10px',
          cursor: 'pointer',
          userSelect: 'none',
          minWidth: 0,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Flex
          direction="row"
          alignItems="center"
          gap={1}
          style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}
        >
          <Icon
            data={expanded ? ChevronDown : ChevronRight}
            size={14}
            style={{ color: 'var(--g-color-text-hint)', flexShrink: 0 }}
          />
          <Text
            variant="subheader-1"
            color="secondary"
            ellipsis
            style={{ minWidth: 0 }}
          >
            {keyName}
          </Text>
        </Flex>
      </Flex>
      {expanded && (
        <Flex
          direction="column"
          gap={2}
          style={{
            padding: '0 10px 12px 10px',
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <ParamStructView
            structParams={structParams}
            values={value}
            level={level}
          />
        </Flex>
      )}
    </Flex>
  );
};

const ParamKVView: React.FC<ParamKVViewProps> = ({
  data,
  nestedType = 'string',
  structParams,
  level = 1,
}) => {
  const { defaultExpanded } = useFormParamViewContext();

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return <EmptyValue message="Invalid key-value data" />;
  }

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <EmptyValue message="Empty key-value" />;
  }

  // Если nested_type === 'struct' и есть structParams — рендерим как сворачиваемые элементы
  if (nestedType === 'struct' && structParams && structParams.length > 0) {
    return (
      <Flex direction="column" gap={2}>
        {entries.map(([key, value]) => (
          <KVStructItemView
            key={key}
            keyName={key}
            structParams={structParams}
            value={value}
            level={level + 1}
            defaultExpanded={defaultExpanded}
          />
        ))}
      </Flex>
    );
  }

  // Для примитивных типов — старое поведение
  return (
    <Flex direction="column" gap={2}>
      {entries.map(([key, value]) => (
        <Flex key={key} direction="row" gap={2} alignItems="flex-start">
          <Text
            variant="body-1"
            color="secondary"
            style={{ fontWeight: 600, minWidth: '100px', flexShrink: 0 }}
          >
            {key}:
          </Text>
          <div style={{ flex: 1 }}>
            {renderPrimitiveValue(value, nestedType)}
          </div>
        </Flex>
      ))}
    </Flex>
  );
};

// ============================================================================
// Компонент для отображения структуры
// ============================================================================

interface ParamStructViewProps {
  structParams: ParamsDC[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>;
  level: number;
}

function ParamStructView({
  structParams,
  values,
  level,
}: ParamStructViewProps): React.ReactElement | null {
  if (!structParams || structParams.length === 0) {
    return null;
  }

  // Собираем элементы для рендеринга, учитывая one_of
  const itemsToRender: Array<{
    type: 'param' | 'oneOf';
    param: ParamsDC;
    value: ParamValue;
  }> = [];

  structParams.forEach((param) => {
    const paramName = param.name || '';
    const paramType = param.type?.type || 'string';

    // Для one_of параметров ищем значения под именами вариантов
    // ВАЖНО: для one_of вариант считается выбранным если он присутствует в values,
    // даже если значение пустое ({}, [], '')
    if (param.one_of && param.one_of.length > 0) {
      param.one_of.forEach((variant) => {
        const variantName = variant.name || '';
        const variantValue = values?.[variantName];

        // Проверяем только на undefined/null — пустые значения тоже отображаем
        if (variantValue !== undefined && variantValue !== null) {
          itemsToRender.push({
            type: 'oneOf',
            param: { ...param, one_of: [variant] },
            value: variantValue,
          });
        }
      });
      return;
    }

    const value = values?.[paramName];

    if (paramType === 'struct') {
      if (!isStructEmpty(value, param.type?.struct_params)) {
        itemsToRender.push({ type: 'param', param, value });
      }
      return;
    }

    if (paramType === 'array' && param.type?.nested_type === 'struct') {
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        !value.every((item) => isStructEmpty(item, param.type?.struct_params))
      ) {
        itemsToRender.push({ type: 'param', param, value });
      }
      return;
    }

    if (!isEmpty(value)) {
      itemsToRender.push({ type: 'param', param, value });
    }
  });

  if (itemsToRender.length === 0) {
    return <EmptyValue message="Empty structure" />;
  }

  return (
    <Flex direction="column" gap={3}>
      {itemsToRender.map((item, index) => {
        if (item.type === 'oneOf') {
          return (
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            <OneOfView
              key={`oneOf-${item.param.name}-${index}`}
              param={item.param}
              values={values}
              level={level}
            />
          );
        }

        const paramName = item.param.name || '';

        return (
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          <ParamItemView
            key={paramName}
            param={item.param}
            value={item.value}
            level={level + 1}
          />
        );
      })}
    </Flex>
  );
}

// ============================================================================
// Компонент для отображения массива структур
// ============================================================================

interface ParamArrayStructViewProps {
  structParams: ParamsDC[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[];
  level: number;
  /** Имя поля структуры, значение которого показывать как метку элемента */
  labelField?: string;
}

// Компонент для одного элемента массива структур со сворачиванием
interface ArrayStructItemViewProps {
  index: number;
  structParams: ParamsDC[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>;
  level: number;
  defaultExpanded?: boolean;
  /** Имя поля структуры, значение которого показывать как метку элемента */
  labelField?: string;
}

const ArrayStructItemView: React.FC<ArrayStructItemViewProps> = ({
  index,
  structParams,
  value,
  level,
  defaultExpanded = false,
  labelField,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Получаем значение поля для метки (если указано)
  const labelValue =
    labelField && value?.[labelField] ? String(value[labelField]) : '';

  return (
    <Flex
      direction="column"
      gap={0}
      style={{
        border: '1px dashed var(--g-color-line-generic)',
      }}
    >
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        style={{
          padding: '6px 10px',
          cursor: 'pointer',
          userSelect: 'none',
          minWidth: 0,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Flex
          direction="row"
          alignItems="center"
          gap={1}
          style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}
        >
          <Icon
            data={expanded ? ChevronDown : ChevronRight}
            size={14}
            style={{ color: 'var(--g-color-text-hint)', flexShrink: 0 }}
          />
          <Text
            variant="subheader-1"
            color="secondary"
            style={{ flexShrink: 0 }}
          >
            [{index}]
          </Text>
          {!expanded && labelValue && (
            <Text
              variant="body-1"
              color="secondary"
              ellipsis
              style={{ marginLeft: '4px', minWidth: 0 }}
            >
              {labelValue}
            </Text>
          )}
        </Flex>
      </Flex>
      {expanded && (
        <Flex
          direction="column"
          gap={2}
          style={{
            padding: '0 10px 12px 10px',
          }}
        >
          <ParamStructView
            structParams={structParams}
            values={value}
            level={level}
          />
        </Flex>
      )}
    </Flex>
  );
};

function ParamArrayStructView({
  structParams,
  values,
  level,
  labelField,
}: ParamArrayStructViewProps): React.ReactElement {
  const { defaultExpanded } = useFormParamViewContext();

  if (!Array.isArray(values) || values.length === 0) {
    return <EmptyValue message="Empty array" />;
  }

  // Фильтруем пустые элементы
  const nonEmptyItems = values
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isStructEmpty(item, structParams));

  if (nonEmptyItems.length === 0) {
    return <EmptyValue message="Empty array" />;
  }

  return (
    <Flex direction="column" gap={2}>
      {nonEmptyItems.map(({ item, index }) => (
        <ArrayStructItemView
          key={index}
          index={index}
          structParams={structParams}
          value={item}
          level={level + 1}
          defaultExpanded={defaultExpanded}
          labelField={labelField}
        />
      ))}
    </Flex>
  );
}

// ============================================================================
// Компонент для отображения one_of
// ============================================================================

interface OneOfViewProps {
  param: ParamsDC;
  values: Record<string, ParamValue>;
  level: number;
}

const OneOfView: React.FC<OneOfViewProps> = ({ param, values, level }) => {
  const { defaultExpanded } = useFormParamViewContext();

  const oneOfVariants = param.one_of || [];
  if (oneOfVariants.length === 0) {
    return <EmptyValue message="No variant selected" />;
  }

  // Находим выбранный вариант по наличию ключа в values
  // ВАЖНО: для one_of вариант считается выбранным если он присутствует в values,
  // даже если значение пустое ({}, [], '')
  const selectedVariant = oneOfVariants.find(
    (variant) =>
      variant.name &&
      Object.prototype.hasOwnProperty.call(values, variant.name) &&
      values[variant.name] !== undefined &&
      values[variant.name] !== null,
  );

  if (!selectedVariant || !selectedVariant.name) {
    return <EmptyValue message="No variant selected" />;
  }

  const variantValue = values[selectedVariant.name];
  const structParams = selectedVariant.type?.struct_params;
  const variantType =
    selectedVariant.type?.type || (structParams ? 'struct' : 'string');
  const nestedType = selectedVariant.type?.nested_type;
  const variantTypeConstraint = selectedVariant.type?.type_constraint as
    | TypeConstraint
    | undefined;

  // Проверяем, является ли вариант примитивным типом
  const isPrimitive =
    variantType === 'string' ||
    variantType === 'integer' ||
    variantType === 'double' ||
    variantType === 'boolean';

  // Проверяем, является ли это multiline строкой
  const isMultilineString =
    variantType === 'string' && isMultilineConstraint(variantTypeConstraint);

  // Для примитивных типов отображаем без disclosure
  if (isPrimitive) {
    return (
      <Flex direction="column" gap={0}>
        <FieldLabel
          name={selectedVariant.name}
          required={param.required}
          description={selectedVariant.description || param.description}
          defaultValue={selectedVariant.default || param.default}
          typeConstraint={variantTypeConstraint}
          type={variantType}
        />
        {isMultilineString ? (
          <MultilineValueView
            paramName={selectedVariant.name}
            value={String(variantValue || '')}
            constraintType={variantTypeConstraint?.string_type}
          />
        ) : (
          renderPrimitiveValue(variantValue, variantType)
        )}
      </Flex>
    );
  }

  // Рендерим поля выбранного варианта напрямую
  const renderVariantFields = (): React.ReactNode => {
    // Для struct - рендерим все его поля напрямую
    if (variantType === 'struct' && structParams && structParams.length > 0) {
      return (
        <ParamStructView
          structParams={structParams}
          values={variantValue as Record<string, unknown>}
          level={level}
        />
      );
    }

    // Для массива структур
    if (
      variantType === 'array' &&
      nestedType === 'struct' &&
      structParams &&
      structParams.length > 0
    ) {
      return (
        <ParamArrayStructView
          structParams={structParams}
          values={variantValue as unknown[]}
          level={level}
        />
      );
    }

    // Для массива примитивов
    if (variantType === 'array' && nestedType) {
      return (
        <ParamArrayView
          values={variantValue as unknown[]}
          nestedType={nestedType}
        />
      );
    }

    // Для key-value
    if (variantType === 'kv') {
      return (
        <ParamKVView
          data={variantValue as Record<string, unknown>}
          nestedType={nestedType}
          structParams={structParams}
          level={level}
        />
      );
    }

    // Для остальных типов
    return renderPrimitiveValue(variantValue, variantType);
  };

  return (
    <FieldDisclosure
      name={selectedVariant.name}
      required={param.required}
      description={selectedVariant.description || param.description}
      defaultValue={selectedVariant.default || param.default}
      typeConstraint={variantTypeConstraint}
      type="one_of"
      defaultExpanded={defaultExpanded}
    >
      {renderVariantFields()}
    </FieldDisclosure>
  );
};

// ============================================================================
// Компонент для отображения одного параметра
// ============================================================================

interface ParamItemViewProps {
  param: ParamsDC;
  value: ParamValue;
  level: number;
  disclosure?: boolean;
  defaultOpen?: boolean;
}

function ParamItemView({
  param,
  value,
  level,
  disclosure = false,
  defaultOpen = false,
}: ParamItemViewProps): React.ReactElement | null {
  const { defaultExpanded, focusedParam } = useFormParamViewContext();

  const paramName = param.name || '';

  // Если есть focusedParam — этот disclosure открыт только если это он
  // Если focusedParam нет — используем defaultOpen
  const isExpanded = focusedParam ? paramName === focusedParam : defaultOpen;
  const paramType = param.type?.type || 'string';
  const nestedType = param.type?.nested_type;
  const structParams = param.type?.struct_params;
  const typeConstraint = param.type?.type_constraint as
    | TypeConstraint
    | undefined;
  const required = param.required || false;
  const description = param.description;
  const defaultValue = param.default;

  const isMultilineString =
    paramType === 'string' && isMultilineConstraint(typeConstraint);

  const isComplexType =
    paramType === 'struct' ||
    paramType === 'array' ||
    paramType === 'kv' ||
    paramType === 'custom' ||
    isMultilineString;

  // Вычисляем количество элементов только для массивов и kv (не для struct)
  const itemsCount = useMemo(() => {
    if (paramType === 'array') {
      return Array.isArray(value) ? value.length : 0;
    }

    if (paramType === 'kv') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).length;
      }
      return 0;
    }

    return undefined;
  }, [paramType, value]);

  // Определяем поле для метки элемента массива
  // Ищем первое строковое поле с "Name" в названии, или просто первое строковое
  const labelField = useMemo(() => {
    if (!structParams) return undefined;

    // Сначала ищем поле с "Name" в названии
    const nameField = structParams.find(
      (p) =>
        p.type?.type === 'string' &&
        p.name &&
        p.name.toLowerCase().includes('name'),
    );
    if (nameField?.name) return nameField.name;

    // Если не нашли, берём первое строковое поле
    const firstStringField = structParams.find(
      (p) => p.type?.type === 'string' && p.name,
    );
    return firstStringField?.name;
  }, [structParams]);

  const renderContent = (): React.ReactNode => {
    // Обработка массивов
    if (paramType === 'array' && nestedType) {
      // Массив структур
      if (nestedType === 'struct' && structParams) {
        return (
          <ParamArrayStructView
            structParams={structParams}
            values={value}
            level={level}
            labelField={labelField}
          />
        );
      }

      // Массив примитивов
      return <ParamArrayView values={value} nestedType={nestedType} />;
    }

    // Обработка key-value
    if (paramType === 'kv') {
      return (
        <ParamKVView
          data={value}
          nestedType={nestedType}
          structParams={structParams}
          level={level}
        />
      );
    }

    // Обработка структур
    if (paramType === 'struct') {
      if (!structParams || structParams.length === 0) {
        return null;
      }

      return (
        <ParamStructView
          structParams={structParams}
          values={value}
          level={level}
        />
      );
    }

    // Обработка custom типа (JSON строка или объект)
    if (paramType === 'custom') {
      // Преобразуем значение в строку для отображения
      let displayValue = '';
      if (typeof value === 'string') {
        displayValue = value;
      } else if (value !== undefined && value !== null) {
        try {
          displayValue = JSON.stringify(value, null, 2);
        } catch {
          displayValue = '';
        }
      }
      return (
        <CustomParamValueView paramName={paramName} value={displayValue} />
      );
    }

    // Обработка multiline строк (если есть constraint с multiline или type)
    if (isMultilineString) {
      return (
        <MultilineValueView
          paramName={paramName}
          value={String(value || '')}
          constraintType={typeConstraint?.string_type}
        />
      );
    }

    // Обработка примитивных типов
    return renderPrimitiveValue(value, paramType);
  };

  // Ранний выход для disclosure на первом уровне
  if (level === 1 && disclosure && isComplexType) {
    // Если есть focusedParam — используем контролируемое состояние
    // иначе — используем defaultExpanded
    return (
      <ParamDisclosure
        title={paramName}
        expanded={focusedParam ? isExpanded : undefined}
        defaultExpanded={focusedParam ? undefined : defaultOpen}
        paddingLeft={0}
        required={required}
        itemsCounter={
          paramType === 'array' || paramType === 'kv' ? itemsCount : undefined
        }
      >
        {renderContent()}
      </ParamDisclosure>
    );
  }

  // Для структур, массивов и kv используем FieldDisclosure с иконкой слева
  // (на любом уровне, если не используется ParamDisclosure)
  if (isComplexType) {
    return (
      <FieldDisclosure
        name={paramName}
        required={required}
        description={description}
        defaultValue={defaultValue}
        typeConstraint={typeConstraint}
        type={paramType}
        nestedType={nestedType}
        defaultExpanded={defaultExpanded}
        itemsCount={itemsCount}
      >
        {renderContent()}
      </FieldDisclosure>
    );
  }

  return (
    <Flex direction="column" gap={0}>
      <FieldLabel
        name={paramName}
        required={required}
        description={description}
        defaultValue={defaultValue}
        typeConstraint={typeConstraint}
        type={paramType !== 'boolean' ? paramType : undefined}
        nestedType={nestedType}
      />
      {renderContent()}
    </Flex>
  );
}

// ============================================================================
// Главный компонент
// ============================================================================

export const FormParamView: React.FC<FormParamViewProps> = ({
  params,
  values,
  level = 1,
  disclosure = false,
  defaultOpen = false,
  defaultExpanded = false,
  focusedParam,
  variableNames,
  onVariableClick,
}) => {
  const contextValue = useMemo(
    () => ({ defaultExpanded, focusedParam, variableNames, onVariableClick }),
    [defaultExpanded, focusedParam, variableNames, onVariableClick],
  );

  // Создаём Map для поиска one_of вариантов по имени варианта
  const oneOfVariantsMap = useMemo(() => {
    const map = new Map<string, { parentParam: ParamsDC; variant: ParamsDC }>();
    params.forEach((param) => {
      if (param.one_of && param.one_of.length > 0) {
        param.one_of.forEach((variant) => {
          if (variant.name) {
            map.set(variant.name, { parentParam: param, variant });
          }
        });
      }
    });
    return map;
  }, [params]);

  if (!params || params.length === 0) {
    return <EmptyValue message="No parameters" />;
  }

  // Собираем все ключи из values
  const valueKeys = Object.keys(values);

  // Фильтруем непустые параметры и добавляем one_of варианты
  const itemsToRender: Array<{
    type: 'param' | 'oneOf';
    param: ParamsDC;
    parentParam?: ParamsDC;
    value: ParamValue;
  }> = [];

  // Сначала обрабатываем обычные параметры
  params.forEach((param) => {
    const paramName = param.name || '';

    // Пропускаем one_of параметры - их варианты будут обработаны отдельно
    if (param.one_of && param.one_of.length > 0) {
      return;
    }

    const value = values[paramName];
    const paramType = param.type?.type || 'string';

    let isNotEmpty = false;
    if (paramType === 'struct') {
      isNotEmpty = !isStructEmpty(value, param.type?.struct_params);
    } else if (paramType === 'array' && param.type?.nested_type === 'struct') {
      isNotEmpty =
        Array.isArray(value) &&
        value.length > 0 &&
        !value.every((item) => isStructEmpty(item, param.type?.struct_params));
    } else {
      isNotEmpty = !isEmpty(value);
    }

    if (isNotEmpty) {
      itemsToRender.push({ type: 'param', param, value });
    }
  });

  // Затем ищем варианты one_of в values
  // ВАЖНО: для one_of вариант считается выбранным если он присутствует в values,
  // даже если значение пустое ({}, [], '')
  valueKeys.forEach((key) => {
    const oneOfInfo = oneOfVariantsMap.get(key);
    // Проверяем только на undefined/null — пустые значения тоже отображаем
    if (oneOfInfo && values[key] !== undefined && values[key] !== null) {
      itemsToRender.push({
        type: 'oneOf',
        param: oneOfInfo.parentParam,
        parentParam: oneOfInfo.parentParam,
        value: values[key],
      });
    }
  });

  if (itemsToRender.length === 0) {
    return <EmptyValue message="All parameters are empty" />;
  }

  return (
    <FormParamViewContext.Provider value={contextValue}>
      <Flex direction="column" gap={3}>
        {itemsToRender.map((item, index) => {
          if (item.type === 'oneOf' && item.parentParam) {
            return (
              <OneOfView
                key={`oneOf-${item.parentParam.name}-${index}`}
                param={item.parentParam}
                values={values}
                level={level}
              />
            );
          }

          const paramName = item.param.name || '';
          const paramType = item.param.type?.type || 'string';

          // Для сложных типов на первом уровне с disclosure
          if (
            level === 1 &&
            disclosure &&
            (paramType === 'struct' ||
              paramType === 'array' ||
              paramType === 'kv' ||
              paramType === 'custom' ||
              (paramType === 'string' &&
                isMultilineConstraint(
                  item.param.type?.type_constraint as
                    | TypeConstraint
                    | undefined,
                )))
          ) {
            return (
              <ParamItemView
                key={paramName}
                param={item.param}
                value={item.value}
                level={level}
                disclosure
                defaultOpen={defaultOpen}
              />
            );
          }

          return (
            <ParamItemView
              key={paramName}
              param={item.param}
              value={item.value}
              level={level}
            />
          );
        })}
      </Flex>
    </FormParamViewContext.Provider>
  );
};
