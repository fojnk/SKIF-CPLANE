import { ChevronDown, ChevronRight, CircleInfoFill } from '@gravity-ui/icons';
import {
  Button,
  Flex,
  Icon,
  Select,
  Text,
  TextArea,
  TextInput,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field, useField, useForm } from 'react-final-form';

import { generateHash } from '@/modules/control-plane/entities/cubes';
import {
  getMonacoLanguage,
  isMultilineConstraint,
} from '@/modules/control-plane/entities/monaco-editor';
import { CustomParamModel } from '@/modules/control-plane/features/custom-param';
import { MultilineEditorModel } from '@/modules/control-plane/features/monaco/multiline-editor';
import {
  ParamsStringTypeDC,
  ParamsTypeConstraintDC,
} from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { ParamsDC } from '@/modules/control-plane/shared/types';
import { validators } from '@/shared/lib/final-form';

import { ValueText } from './form-param-view';
import {
  AddButton,
  DeleteButton,
  ParamDisclosure,
  ParamsInfoPopover,
  ParamTypeLabel,
  RadioBoolean,
} from './ui';

// ============================================================================
// Context для настроек FormParamEdit
// ============================================================================

interface FormParamEditContextValue {
  addButtonVariant: 'outlined' | 'normal';
  size: 's' | 'm' | 'l' | 'xl';
  /** Раскрыты ли вложенные disclosure по умолчанию */
  defaultExpanded: boolean;
  /** Максимальный уровень глубины для раскрытия disclosure (по умолчанию 2) */
  maxExpandedLevel?: number;
  /** Имя параметра для принудительного раскрытия */
  focusedParam?: string | null;
  /** Список доступных переменных (имена) для валидации ${variableName} */
  variableNames?: Set<string>;
  /**
   * Полные имена полей (например models, Worker.Foo.items), для которых
   * у массива структур скрыта кнопка «Add Item» — элементы только программно / из маркетплейса.
   */
  arrayStructAddDisabledPaths?: ReadonlySet<string>;
}

const FormParamEditContext = createContext<FormParamEditContextValue>({
  addButtonVariant: 'outlined',
  size: 'm',
  defaultExpanded: false,
  maxExpandedLevel: 2,
  focusedParam: null,
  variableNames: undefined,
});

const useFormParamEditContext = () => useContext(FormParamEditContext);

// ============================================================================
// Утилиты для работы с переменными ${variableName}
// ============================================================================

/** Регулярное выражение для поиска переменных ${variableName} */
const VARIABLE_PATTERN = /\$\{([^}]+)\}/g;

/**
 * Проверяет, содержит ли значение переменные ${...}
 */
const containsVariable = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  // Reset lastIndex для глобального regex перед test()
  VARIABLE_PATTERN.lastIndex = 0;
  return VARIABLE_PATTERN.test(value);
};

/**
 * Извлекает все имена переменных из значения
 * Например: "${var1} text ${var2}" → ["var1", "var2"]
 */
const extractVariableNames = (value: string): string[] => {
  if (!value || typeof value !== 'string') return [];
  const names: string[] = [];
  // Reset lastIndex для глобального regex
  VARIABLE_PATTERN.lastIndex = 0;
  let match;
  while ((match = VARIABLE_PATTERN.exec(value)) !== null) {
    names.push(match[1]);
  }
  return names;
};

/**
 * Валидирует переменные в значении
 * Возвращает ошибку если какая-то переменная не существует
 */
const validateVariables = (
  value: string,
  availableVariables: Set<string> | undefined,
): string | undefined => {
  if (!value || typeof value !== 'string') return undefined;
  if (!containsVariable(value)) return undefined;

  const usedVariables = extractVariableNames(value);
  if (usedVariables.length === 0) return undefined;

  // Если список переменных не передан — не можем валидировать
  if (!availableVariables) return undefined;

  const missingVariables = usedVariables.filter(
    (name) => !availableVariables.has(name),
  );

  if (missingVariables.length > 0) {
    if (missingVariables.length === 1) {
      return `Variable «${missingVariables[0]}» not found`;
    }
    return `Variables not found: ${missingVariables.join(', ')}`;
  }

  return undefined;
};

// ============================================================================
// Типы
// ============================================================================

// Используем ParamsTypeConstraintDC из data-contracts
type TypeConstraint = ParamsTypeConstraintDC;

interface FormParamEditProps {
  params: ParamsDC[];
  fieldNamePrefix?: string;
  level?: number;
  size?: 's' | 'm' | 'l' | 'xl';
  /** Вариант кнопки Add: 'outlined' (по умолчанию) или 'normal' */
  addButtonVariant?: 'outlined' | 'normal';
  /** Использовать disclosure для сложных типов на первом уровне */
  disclosure?: boolean;
  /** Раскрыт ли disclosure первого уровня по умолчанию */
  defaultOpen?: boolean;
  /** Раскрыты ли вложенные disclosure (2+ уровень) по умолчанию (по умолчанию false — закрыты) */
  defaultExpanded?: boolean;
  /** Максимальный уровень глубины для раскрытия disclosure (по умолчанию 2) */
  maxExpandedLevel?: number;
  /** Имя параметра для принудительного раскрытия (остальные будут свёрнуты) */
  focusedParam?: string | null;
  /** Список имён доступных переменных для валидации ${variableName} */
  variableNames?: Set<string>;
  /**
   * Имена полей-массивов структур без ручного «Add Item» (полный путь как в final-form: models, A.B.items).
   */
  arrayStructAddDisabledPaths?: readonly string[];
}

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
// Компонент для редактирования custom параметра
// ============================================================================

interface CustomParamValueEditProps {
  paramName: string;
  fieldName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldValue: any;
}

const CustomParamValueEdit: React.FC<CustomParamValueEditProps> = ({
  paramName,
  fieldName,
  fieldValue,
}) => {
  const openModal = useUnit(CustomParamModel.start);
  const form = useForm();

  // Преобразуем значение в строку для отображения
  let displayValue = '';
  if (typeof fieldValue === 'string') {
    displayValue = fieldValue;
  } else if (fieldValue !== undefined && fieldValue !== null) {
    try {
      displayValue = JSON.stringify(fieldValue, null, 2);
    } catch {
      displayValue = '';
    }
  }

  const handleEdit = () => {
    openModal({
      paramName,
      value: displayValue,
      mode: 'edit',
      onSave: (newValue: string) => {
        form.change(fieldName, newValue);
      },
    });
  };

  return (
    <Flex direction="column" alignItems="flex-start" gap={1}>
      <Button view="flat-action" size="xs" onClick={handleEdit}>
        Edit custom param
      </Button>
      <ValueText value={displayValue} />
    </Flex>
  );
};

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
  /** Выбранный вариант для one_of (показывается когда свёрнут) */
  selectedVariant?: string;
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
  selectedVariant,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Для one_of когда свёрнут: показываем выбранный вариант вместо общего имени
  const displayName =
    !expanded && selectedVariant ? `${name}: ${selectedVariant}` : name;

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
              {displayName}
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
// Примитивные компоненты с валидацией constraints
// ============================================================================

interface PrimitiveStringProps {
  fieldName: string;
  required?: boolean;
  size?: 's' | 'm' | 'l' | 'xl';
  constraint?: TypeConstraint;
  placeholder?: string;
  onBlur?: () => void;
}

const PrimitiveString: React.FC<PrimitiveStringProps> = ({
  fieldName,
  required = false,
  size = 'm',
  constraint,
  placeholder,
  onBlur,
}) => {
  const { variableNames } = useFormParamEditContext();

  const validate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any) => {
      // Сначала проверяем required
      const requiredError = validators.build({ required })(value);
      if (requiredError) return requiredError;

      const strValue = String(value || '');

      // Если значение содержит переменные — валидируем их существование
      if (containsVariable(strValue)) {
        return validateVariables(strValue, variableNames);
      }

      // Валидация длины строки (только если нет переменных)
      if (
        constraint?.length !== undefined &&
        value &&
        strValue.length > constraint.length
      ) {
        return `Max length: ${constraint.length} (current: ${strValue.length})`;
      }

      return undefined;
    },
    [required, constraint?.length, variableNames],
  );

  // Если есть enum - показываем Select
  if (constraint?.enum && constraint.enum.length > 0) {
    return (
      <Field name={fieldName} validate={validate}>
        {({ input, meta }) => (
          <Select
            value={input.value ? [input.value] : []}
            onUpdate={(values) => input.onChange(values[0] || '')}
            placeholder={placeholder || 'Select value'}
            size={size}
            width="max"
            validationState={meta.touched && meta.error ? 'invalid' : undefined}
            errorMessage={meta.touched && meta.error ? meta.error : undefined}
          >
            {constraint.enum!.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        )}
      </Field>
    );
  }

  // Если multiline или string_type === 'text'/'yaml'/'python'/'json'/'yql' - TextArea
  if (isMultilineConstraint(constraint)) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      <MultilineTextArea
        fieldName={fieldName}
        validate={validate}
        placeholder={placeholder}
        size={size}
        constraintType={constraint?.string_type}
      />
    );
  }

  // Обычный TextInput
  return (
    <Field name={fieldName} validate={validate}>
      {({ input, meta }) => (
        <TextInput
          value={input.value || ''}
          onUpdate={input.onChange}
          onBlur={(e) => {
            input.onBlur(e);
            onBlur?.();
          }}
          placeholder={placeholder}
          size={size}
          validationState={meta.touched && meta.error ? 'invalid' : undefined}
          errorMessage={meta.touched && meta.error ? meta.error : undefined}
        />
      )}
    </Field>
  );
};

// ============================================================================
// Компонент TextArea с кнопкой расширения в Monaco Editor
// ============================================================================

interface MultilineTextAreaProps {
  fieldName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate: (value: any) => string | undefined;
  placeholder?: string;
  size?: 's' | 'm' | 'l' | 'xl';
  constraintType?: ParamsStringTypeDC | 'yaml';
}

const MultilineTextArea: React.FC<MultilineTextAreaProps> = ({
  fieldName,
  validate,
  placeholder,
  size = 'm',
  constraintType,
}) => {
  const openModal = useUnit(MultilineEditorModel.start);

  return (
    <Field name={fieldName} validate={validate}>
      {({ input, meta }) => {
        const handleExpand = () => {
          openModal({
            paramName: fieldName.split('.').pop() || fieldName,
            value: input.value || '',
            language: getMonacoLanguage(constraintType),
            onSave: (newValue: string) => {
              input.onChange(newValue);
            },
          });
        };

        return (
          <Flex direction="column" gap={1} alignItems="flex-start">
            <Button view="flat-action" size="xs" onClick={handleExpand}>
              Edit in modal
            </Button>
            <TextArea
              value={input.value || ''}
              onUpdate={input.onChange}
              onBlur={input.onBlur}
              placeholder={placeholder}
              size={size}
              minRows={3}
              maxRows={10}
              validationState={
                meta.touched && meta.error ? 'invalid' : undefined
              }
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
              style={{ paddingRight: '20px' }}
            />
          </Flex>
        );
      }}
    </Field>
  );
};

interface PrimitiveNumberProps {
  fieldName: string;
  required?: boolean;
  size?: 's' | 'm' | 'l' | 'xl';
  type: 'integer' | 'double';
  constraint?: TypeConstraint;
  placeholder?: string;
}

const PrimitiveNumber: React.FC<PrimitiveNumberProps> = ({
  fieldName,
  required = false,
  size = 'm',
  type,
  constraint,
  placeholder,
}) => {
  const { variableNames } = useFormParamEditContext();

  const validate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any) => {
      // Сначала проверяем required
      const requiredError = validators.build({ required })(value);
      if (requiredError) return requiredError;

      if (!value || value === '') return undefined;

      const str = String(value).trim();

      // Если значение содержит переменные — валидируем их существование
      // и пропускаем проверки формата числа и constraints
      if (containsVariable(str)) {
        return validateVariables(str, variableNames);
      }

      // Проверяем формат числа (только если нет переменных)
      if (type === 'integer') {
        if (!/^-?\d+$/.test(str)) {
          return 'Must be an integer';
        }
      } else if (type === 'double') {
        if (!/^-?\d*\.?\d+([eE][+-]?\d+)?$/.test(str)) {
          return 'Must be a number';
        }
      }

      // Валидация gt (greater than) и lt (less than)
      const numValue = parseFloat(str);
      if (!isNaN(numValue)) {
        if (constraint?.gt !== undefined && numValue <= constraint.gt) {
          return `Value must be > ${constraint.gt}`;
        }
        if (constraint?.lt !== undefined && numValue >= constraint.lt) {
          return `Value must be < ${constraint.lt}`;
        }
      }

      return undefined;
    },
    [required, type, constraint?.gt, constraint?.lt, variableNames],
  );

  return (
    <Field name={fieldName} validate={validate}>
      {({ input, meta }) => (
        <TextInput
          value={input.value !== undefined ? String(input.value) : ''}
          onUpdate={input.onChange}
          onBlur={input.onBlur}
          placeholder={placeholder}
          size={size}
          validationState={meta.touched && meta.error ? 'invalid' : undefined}
          errorMessage={meta.touched && meta.error ? meta.error : undefined}
        />
      )}
    </Field>
  );
};

interface PrimitiveBooleanProps {
  fieldName: string;
  required?: boolean;
  size?: 's' | 'm' | 'l' | 'xl';
  showUndefined?: boolean;
}

const PrimitiveBoolean: React.FC<PrimitiveBooleanProps> = ({
  fieldName,
  required = false,
  size = 's',
  showUndefined = true,
}) => {
  return (
    <Field name={fieldName} validate={validators.build({ required })}>
      {({ input }) => {
        // Конвертируем строковое значение в boolean | undefined
        let boolValue: boolean | undefined;
        if (input.value === 'true' || input.value === true) {
          boolValue = true;
        } else if (input.value === 'false' || input.value === false) {
          boolValue = false;
        } else {
          boolValue = undefined;
        }

        return (
          <RadioBoolean
            value={boolValue}
            onChange={(value) => {
              // Сохраняем как строку для совместимости с формой
              if (value === true) {
                input.onChange('true');
              } else if (value === false) {
                input.onChange('false');
              } else {
                input.onChange('undefined');
              }
            }}
            allowUndefined={showUndefined}
            required={required}
            size={size}
          />
        );
      }}
    </Field>
  );
};

// ============================================================================
// Компоненты для массивов и key-value
// ============================================================================

interface ParamFieldArrayProps {
  fieldName: string;
  required?: boolean;
  nestedType?: string;
  constraint?: TypeConstraint;
}

const ParamFieldArray: React.FC<ParamFieldArrayProps> = ({
  fieldName,
  required = false,
  nestedType = 'string',
  constraint,
}) => {
  const { addButtonVariant, size } = useFormParamEditContext();
  const field = useField(fieldName, {
    validate: validators.build({ required }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = field.input.value || [];

  const handleAdd = () => {
    let defaultItem = '';
    if (nestedType === 'integer' || nestedType === 'double') {
      defaultItem = '';
    } else if (nestedType === 'boolean') {
      defaultItem = 'undefined';
    }
    const newValues = [...values, defaultItem];
    field.input.onChange(newValues);
  };

  const handleRemove = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newValues = values.filter((_: any, i: number) => i !== index);
    field.input.onChange(newValues);
  };

  const renderItemEditor = (index: number) => {
    const itemFieldName = `${fieldName}[${index}]`;

    switch (nestedType) {
      case 'boolean':
        return (
          <PrimitiveBoolean
            fieldName={itemFieldName}
            size="s"
            showUndefined={false}
          />
        );
      case 'integer':
        return (
          <PrimitiveNumber
            fieldName={itemFieldName}
            size={size}
            type="integer"
            constraint={constraint}
            placeholder={`Item ${index + 1}`}
          />
        );
      case 'double':
        return (
          <PrimitiveNumber
            fieldName={itemFieldName}
            size={size}
            type="double"
            constraint={constraint}
            placeholder={`Item ${index + 1}`}
          />
        );
      case 'string':
      default:
        return (
          <PrimitiveString
            fieldName={itemFieldName}
            size={size}
            constraint={constraint}
            placeholder={`Item ${index + 1}`}
          />
        );
    }
  };

  return (
    <Flex direction="column" gap={2}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {values.map((_: any, index: number) => (
        <Flex key={index} gap={2} alignItems="center">
          <div style={{ flex: 1 }}>{renderItemEditor(index)}</div>
          <DeleteButton onClick={() => handleRemove(index)} size={size} />
        </Flex>
      ))}
      <AddButton onClick={handleAdd} variant={addButtonVariant}>
        Add Item
      </AddButton>
    </Flex>
  );
};

interface KVPair {
  id: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface ParamFieldKVProps {
  fieldName: string;
  required?: boolean;
  nestedType?: string;
  constraint?: TypeConstraint;
}

const ParamFieldKV: React.FC<ParamFieldKVProps> = ({
  fieldName,
  required = false,
  nestedType = 'string',
  constraint,
}) => {
  const { addButtonVariant, size } = useFormParamEditContext();
  const nextIdRef = useRef(0);
  const field = useField(fieldName, {
    validate: validators.build({ required }),
  });

  // Преобразуем объект в массив пар с уникальными ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valuesToPairs = (obj: Record<string, any>): KVPair[] => {
    return Object.entries(obj || {}).map(([key, value], index) => ({
      id: `${index}-${key}`,
      key,
      value,
    }));
  };

  // Преобразуем массив пар обратно в объект
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pairsToValues = (pairs: KVPair[]): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    pairs.forEach((pair) => {
      if (pair.key !== '') {
        result[pair.key] = pair.value;
      }
    });
    return result;
  };

  const [pairs, setPairs] = React.useState<KVPair[]>(() =>
    valuesToPairs(field.input.value),
  );

  // Синхронизируем pairs с field.input.value при внешних изменениях
  useEffect(() => {
    const newPairs = valuesToPairs(field.input.value);
    const currentValues = pairsToValues(pairs);
    // Обновляем только если структура действительно изменилась
    if (JSON.stringify(currentValues) !== JSON.stringify(field.input.value)) {
      setPairs(newPairs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.input.value]);

  const updateField = (newPairs: KVPair[]) => {
    setPairs(newPairs);
    field.input.onChange(pairsToValues(newPairs));
  };

  const handleAdd = () => {
    const newPairs = [
      ...pairs,
      {
        id: `${Date.now()}-${nextIdRef.current++}`,
        key: '',
        value: '',
      },
    ];
    updateField(newPairs);
  };

  const handleRemove = (id: string) => {
    const newPairs = pairs.filter((pair) => pair.id !== id);
    updateField(newPairs);
  };

  const handleKeyChange = (id: string, newKey: string) => {
    const newPairs = pairs.map((pair) =>
      pair.id === id ? { ...pair, key: newKey } : pair,
    );
    updateField(newPairs);
  };

  const handleValueChange = (id: string, value: string) => {
    const newPairs = pairs.map((pair) => {
      if (pair.id !== id) return pair;

      // Преобразуем значение в зависимости от типа
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let transformedValue: any = value;
      if (nestedType === 'integer') {
        transformedValue = value === '' ? '' : parseInt(value, 10);
      } else if (nestedType === 'double') {
        transformedValue = value === '' ? '' : parseFloat(value);
      }

      return { ...pair, value: transformedValue };
    });
    updateField(newPairs);
  };

  const renderValueEditor = (pair: KVPair) => {
    // Для boolean используем RadioBoolean напрямую
    if (nestedType === 'boolean') {
      let boolValue: boolean | undefined;
      if (pair.value === 'true' || pair.value === true) {
        boolValue = true;
      } else if (pair.value === 'false' || pair.value === false) {
        boolValue = false;
      } else {
        boolValue = undefined;
      }

      return (
        <RadioBoolean
          value={boolValue}
          onChange={(value) => {
            if (value === true) {
              handleValueChange(pair.id, 'true');
            } else if (value === false) {
              handleValueChange(pair.id, 'false');
            } else {
              handleValueChange(pair.id, 'undefined');
            }
          }}
          allowUndefined={false}
          size="s"
        />
      );
    }

    // Для остальных типов используем TextInput с валидацией
    const hasLengthError =
      constraint?.length !== undefined &&
      pair.value &&
      String(pair.value).length > constraint.length;

    const hasGtError =
      constraint?.gt !== undefined &&
      pair.value !== '' &&
      !isNaN(parseFloat(pair.value)) &&
      parseFloat(pair.value) <= constraint.gt;

    const hasLtError =
      constraint?.lt !== undefined &&
      pair.value !== '' &&
      !isNaN(parseFloat(pair.value)) &&
      parseFloat(pair.value) >= constraint.lt;

    const hasError = hasLengthError || hasGtError || hasLtError;

    let errorMessage: string | undefined;
    if (hasLengthError) {
      errorMessage = `Max length: ${constraint!.length}`;
    } else if (hasGtError) {
      errorMessage = `Value must be > ${constraint!.gt}`;
    } else if (hasLtError) {
      errorMessage = `Value must be < ${constraint!.lt}`;
    }

    return (
      <TextInput
        value={String(pair.value)}
        onUpdate={(val) => handleValueChange(pair.id, val)}
        placeholder="Value"
        type={
          nestedType === 'integer' || nestedType === 'double'
            ? 'number'
            : 'text'
        }
        size={size}
        style={{ flex: 1 }}
        validationState={hasError ? 'invalid' : undefined}
        errorMessage={errorMessage}
      />
    );
  };

  return (
    <Flex direction="column" gap={2}>
      {pairs.map((pair) => (
        <Flex key={pair.id} gap={2} alignItems="center">
          <TextInput
            value={pair.key}
            onUpdate={(val) => handleKeyChange(pair.id, val)}
            placeholder="Key"
            size={size}
            style={{ flex: 1 }}
          />
          {renderValueEditor(pair)}
          <DeleteButton onClick={() => handleRemove(pair.id)} size={size} />
        </Flex>
      ))}
      <AddButton onClick={handleAdd} variant={addButtonVariant}>
        Add Pair
      </AddButton>
    </Flex>
  );
};

// ============================================================================
// Компонент для редактирования KV со структурами
// ============================================================================

interface ParamFieldKVStructProps {
  fieldName: string;
  structParams: ParamsDC[];
  level: number;
  required?: boolean;
}

// Компонент для одного элемента KV со структурой (со сворачиванием)
interface KVStructItemProps {
  keyName: string;
  fieldName: string;
  structParams: ParamsDC[];
  level: number;
  onRemove: () => void;
  onKeyChange: (newKey: string) => void;
  defaultExpanded?: boolean;
}

const KVStructItem: React.FC<KVStructItemProps> = ({
  keyName,
  fieldName,
  structParams,
  level,
  onRemove,
  onKeyChange,
  defaultExpanded = true,
}) => {
  const { size } = useFormParamEditContext();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [localKey, setLocalKey] = useState(keyName);

  // Синхронизируем локальный ключ с внешним
  useEffect(() => {
    setLocalKey(keyName);
  }, [keyName]);

  const handleKeyBlur = () => {
    if (localKey !== keyName) {
      onKeyChange(localKey);
    }
  };

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
          gap={2}
          style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
        >
          <Icon
            data={expanded ? ChevronDown : ChevronRight}
            size={14}
            style={{ color: 'var(--g-color-text-hint)', flexShrink: 0 }}
          />
          <Text variant="body-1" color="secondary" style={{ flexShrink: 0 }}>
            key:
          </Text>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, minWidth: 0 }}
          >
            <TextInput
              value={localKey}
              onUpdate={setLocalKey}
              onBlur={handleKeyBlur}
              placeholder="Key"
              size={size}
            />
          </div>
        </Flex>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ flexShrink: 0 }}
        >
          <DeleteButton onClick={onRemove} size="xs" />
        </div>
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
          <ParamStructEdit
            fieldName={fieldName}
            structParams={structParams}
            level={level}
          />
        </Flex>
      )}
    </Flex>
  );
};

function ParamFieldKVStruct({
  fieldName,
  structParams,
  level,
  required = false,
}: ParamFieldKVStructProps): React.ReactElement {
  const {
    addButtonVariant,
    defaultExpanded,
    maxExpandedLevel = 2,
  } = useFormParamEditContext();
  const nextIdRef = useRef(0);
  const field = useField(fieldName, {
    validate: validators.build({ required }),
  });

  // Отслеживаем ключи только что добавленных элементов (они должны быть раскрыты)
  const [newlyAddedKeys, setNewlyAddedKeys] = useState<Set<string>>(new Set());

  // Получаем текущее значение как объект
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kvObject: Record<string, any> = field.input.value || {};
  const keys = Object.keys(kvObject);

  // Создаем пустую структуру на основе structParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createEmptyStruct = (): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptyStruct: Record<string, any> = {};
    structParams.forEach((param) => {
      const paramName = param.name || '';
      const paramType = param.type?.type || 'string';

      if (param.one_of && param.one_of.length > 0) {
        return;
      }

      // Если есть default значение в схеме — используем его
      if (param.default !== undefined) {
        // Для boolean конвертируем в строку (формат формы)
        if (paramType === 'boolean') {
          emptyStruct[paramName] = String(param.default);
        } else {
          emptyStruct[paramName] = param.default;
        }
        return;
      }

      if (paramType === 'boolean') {
        emptyStruct[paramName] = 'undefined';
      } else if (paramType === 'array') {
        emptyStruct[paramName] = [];
      } else if (paramType === 'kv') {
        emptyStruct[paramName] = {};
      } else if (paramType === 'struct') {
        emptyStruct[paramName] = {};
      } else {
        emptyStruct[paramName] = '';
      }
    });
    return emptyStruct;
  };

  const handleAdd = () => {
    const newKey = `key_${nextIdRef.current++}`;
    const newValue = {
      ...kvObject,
      [newKey]: createEmptyStruct(),
    };
    field.input.onChange(newValue);
    setNewlyAddedKeys((prev) => new Set(prev).add(newKey));
  };

  const handleRemove = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newValue: Record<string, any> = {};
    Object.entries(kvObject).forEach(([k, v]) => {
      if (k !== key) {
        newValue[k] = v;
      }
    });
    field.input.onChange(newValue);
    setNewlyAddedKeys((prev) => {
      const updated = new Set(prev);
      updated.delete(key);
      return updated;
    });
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || newKey === '') return;
    // Проверяем, что новый ключ не существует
    if (kvObject[newKey] !== undefined) return;

    // Создаём новый объект с сохранением порядка ключей
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newValue: Record<string, any> = {};
    Object.entries(kvObject).forEach(([k, v]) => {
      if (k === oldKey) {
        newValue[newKey] = v;
      } else {
        newValue[k] = v;
      }
    });
    field.input.onChange(newValue);

    // Обновляем newlyAddedKeys
    setNewlyAddedKeys((prev) => {
      if (prev.has(oldKey)) {
        const updated = new Set(prev);
        updated.delete(oldKey);
        updated.add(newKey);
        return updated;
      }
      return prev;
    });
  };

  return (
    <Flex direction="column" gap={2}>
      {keys.map((key) => (
        <KVStructItem
          key={key}
          keyName={key}
          fieldName={`${fieldName}.${key}`}
          structParams={structParams}
          level={level + 1}
          onRemove={() => handleRemove(key)}
          onKeyChange={(newKey) => handleKeyChange(key, newKey)}
          defaultExpanded={
            newlyAddedKeys.has(key) ||
            (defaultExpanded && level + 1 <= maxExpandedLevel)
          }
        />
      ))}
      <AddButton onClick={handleAdd} variant={addButtonVariant}>
        Add Item
      </AddButton>
    </Flex>
  );
}

// ============================================================================
// Компонент для редактирования структуры
// ============================================================================

interface ParamStructEditProps {
  fieldName: string;
  structParams: ParamsDC[];
  level: number;
}

function ParamStructEdit({
  fieldName,
  structParams,
  level,
}: ParamStructEditProps): React.ReactElement | null {
  if (!structParams || structParams.length === 0) {
    return null;
  }

  return (
    <Flex direction="column" gap={3}>
      {structParams.map((item) => {
        const itemName = item.name || '';
        const itemFieldName = `${fieldName}.${itemName}`;

        // Проверяем one_of ДО рендеринга ParamItemEdit
        // Параметр может не иметь type, но иметь one_of
        if (item.one_of && item.one_of.length > 0) {
          return (
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            <OneOfEdit
              key={itemName}
              param={item}
              fieldNamePrefix={fieldName}
              level={level + 1}
            />
          );
        }

        return (
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          <ParamItemEdit
            key={itemName}
            param={item}
            fieldName={itemFieldName}
            level={level + 1}
          />
        );
      })}
    </Flex>
  );
}

// ============================================================================
// Компонент для редактирования массива структур
// ============================================================================

interface ParamArrayStructEditProps {
  fieldName: string;
  structParams: ParamsDC[];
  level: number;
  required?: boolean;
}

// Компонент для одного элемента массива структур со сворачиванием
interface ArrayStructItemProps {
  index: number;
  fieldName: string;
  structParams: ParamsDC[];
  level: number;
  onRemove: (index: number) => void;
  defaultExpanded?: boolean;
  /** Имя поля структуры, значение которого показывать как метку элемента */
  labelField?: string;
}

const ArrayStructItem: React.FC<ArrayStructItemProps> = ({
  index,
  fieldName,
  structParams,
  level,
  onRemove,
  defaultExpanded = true,
  labelField,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Получаем значение поля для метки (если указано)
  const labelFieldName = labelField ? `${fieldName}.${labelField}` : '';
  const labelFieldState = useField(labelFieldName, {
    subscription: { value: true },
  });
  const labelValue =
    labelField && labelFieldState.input.value
      ? String(labelFieldState.input.value)
      : '';

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
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ flexShrink: 0 }}
        >
          <DeleteButton onClick={() => onRemove(index)} size="xs" />
        </div>
      </Flex>
      {expanded && (
        <Flex
          direction="column"
          gap={2}
          style={{
            padding: '0 10px 12px 10px',
          }}
        >
          <ParamStructEdit
            fieldName={fieldName}
            structParams={structParams}
            level={level}
          />
        </Flex>
      )}
    </Flex>
  );
};

function ParamArrayStructEdit({
  fieldName,
  structParams,
  level,
  required = false,
}: ParamArrayStructEditProps): React.ReactElement {
  const {
    addButtonVariant,
    defaultExpanded,
    maxExpandedLevel = 2,
    arrayStructAddDisabledPaths,
  } = useFormParamEditContext();
  const disableManualAdd = arrayStructAddDisabledPaths?.has(fieldName) ?? false;
  const field = useField(fieldName, {
    validate: validators.build({ required }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = useMemo(() => field.input.value || [], [field.input.value]);

  // Отслеживаем индексы только что добавленных элементов (они должны быть раскрыты)
  const [newlyAddedIndices, setNewlyAddedIndices] = useState<Set<number>>(
    new Set(),
  );

  // Определяем поле для метки элемента массива
  // Ищем первое строковое поле с "Name" в названии, или просто первое строковое поле
  const labelField = useMemo(() => {
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

  // Проверяем, является ли это массивом InputSources в Resharder
  const isResharderInputSources = fieldName === 'Resharder.InputSources';

  // Создаем пустую структуру на основе structParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createEmptyStruct = (): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptyStruct: Record<string, any> = {};

    // Для InputSources генерируем уникальный portHash для связи с графом
    if (isResharderInputSources) {
      const portHash = `port_${generateHash(8)}`;
      emptyStruct.portHash = portHash;
      // Сразу заполняем SourceName значением resh_hash4
      const hash4 = portHash.substring(5, 9); // Берем 4 символа после "port_"
      emptyStruct.SourceName = `resh_${hash4}`;
    }

    structParams.forEach((param) => {
      const paramName = param.name || '';
      const paramType = param.type?.type || 'string';

      // Проверяем one_of ДО проверки типа
      // Параметр может не иметь type, но иметь one_of
      if (param.one_of && param.one_of.length > 0) {
        // Для one_of не создаём значение по умолчанию,
        // пользователь должен выбрать вариант
        return;
      }

      // Если есть default значение в схеме — используем его
      if (param.default !== undefined) {
        // Для boolean конвертируем в строку (формат формы)
        if (paramType === 'boolean') {
          emptyStruct[paramName] = String(param.default);
        } else {
          emptyStruct[paramName] = param.default;
        }
        return;
      }

      // Устанавливаем значения по умолчанию в зависимости от типа
      if (paramType === 'boolean') {
        emptyStruct[paramName] = 'undefined';
      } else if (paramType === 'array') {
        emptyStruct[paramName] = [];
      } else if (paramType === 'kv') {
        emptyStruct[paramName] = {};
      } else if (paramType === 'struct') {
        emptyStruct[paramName] = {};
      } else {
        emptyStruct[paramName] = '';
      }
    });
    return emptyStruct;
  };

  const handleAdd = () => {
    const newIndex = values.length;
    const newValues = [...values, createEmptyStruct()];
    field.input.onChange(newValues);
    // Помечаем новый элемент как только что добавленный
    setNewlyAddedIndices((prev) => new Set(prev).add(newIndex));
  };

  const handleRemove = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newValues = values.filter((_: any, i: number) => i !== index);
    field.input.onChange(newValues);
    // Обновляем индексы: удаляем текущий и сдвигаем остальные
    setNewlyAddedIndices((prev) => {
      const updated = new Set<number>();
      prev.forEach((i) => {
        if (i < index) {
          updated.add(i);
        } else if (i > index) {
          updated.add(i - 1);
        }
      });
      return updated;
    });
  };

  return (
    <Flex direction="column" gap={2}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {values.map((_: any, index: number) => (
        <ArrayStructItem
          key={index}
          index={index}
          fieldName={`${fieldName}[${index}]`}
          structParams={structParams}
          level={level + 1}
          onRemove={handleRemove}
          defaultExpanded={
            newlyAddedIndices.has(index) ||
            (defaultExpanded && level + 1 <= maxExpandedLevel)
          }
          labelField={labelField}
        />
      ))}
      {!disableManualAdd ? (
        <AddButton onClick={handleAdd} variant={addButtonVariant}>
          Add Item
        </AddButton>
      ) : null}
    </Flex>
  );
}

// ============================================================================
// Компонент для редактирования one_of
// ============================================================================

interface OneOfEditProps {
  param: ParamsDC;
  fieldNamePrefix: string;
  level: number;
}

function OneOfEdit({
  param,
  fieldNamePrefix,
  level,
}: OneOfEditProps): React.ReactElement | null {
  const {
    size,
    defaultExpanded,
    maxExpandedLevel = 2,
  } = useFormParamEditContext();

  const oneOfVariants = useMemo(() => param.one_of || [], [param.one_of]);

  // Получаем все возможные значения вариантов из формы
  // Хуки должны вызываться всегда в одном порядке
  const variantFields = oneOfVariants.map((variant) => {
    const variantFieldName = fieldNamePrefix
      ? `${fieldNamePrefix}.${variant.name}`
      : variant.name || '';
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useField(variantFieldName, { subscription: { value: true } });
  });

  // Определяем начальный выбранный вариант по наличию значения в форме
  // ВАЖНО: для one_of вариант считается выбранным если значение присутствует,
  // даже если оно пустое ({}, [])
  // Но пустая строка '' НЕ считается выбранным вариантом (это дефолт React Final Form)
  const getInitialSelectedVariant = useCallback((): string | undefined => {
    for (let i = 0; i < oneOfVariants.length; i++) {
      const fieldValue = variantFields[i]?.input.value;
      const variantType = oneOfVariants[i].type?.type;

      // Проверяем что значение действительно установлено (не undefined и не null)
      if (fieldValue === undefined || fieldValue === null) {
        continue;
      }

      // Пустая строка '' — не считаем выбранным вариантом
      // React Final Form создаёт пустые строки для неинициализированных полей
      if (fieldValue === '') {
        continue;
      }

      // Строка 'undefined' для boolean — не считаем выбранным вариантом
      // (это специальное значение означающее "не выбрано")
      if (variantType === 'boolean' && fieldValue === 'undefined') {
        continue;
      }

      // Вариант выбран — значение присутствует (даже если пустое {} или [])
      return oneOfVariants[i].name;
    }
    return undefined;
  }, [oneOfVariants, variantFields]);

  // Вычисляем выбранный вариант напрямую из данных формы
  // Не используем локальное состояние для определения — только для "ручного" выбора
  const selectedFromForm = getInitialSelectedVariant();

  // Локальное состояние для отслеживания выбранного варианта (только после ручного выбора)
  const [manuallySelectedVariant, setManuallySelectedVariant] = useState<
    string | undefined
  >(undefined);

  // Ключ для сброса состояния при смене контекста (новый элемент массива)
  const contextKey = `${fieldNamePrefix}.${param.name}`;
  const prevContextKeyRef = useRef(contextKey);

  // Сбрасываем ручной выбор при смене контекста
  useEffect(() => {
    if (prevContextKeyRef.current !== contextKey) {
      prevContextKeyRef.current = contextKey;
      setManuallySelectedVariant(undefined);
    }
  }, [contextKey]);

  // Итоговый выбранный вариант: ручной выбор имеет приоритет, иначе берём из формы
  const selectedVariantName = manuallySelectedVariant ?? selectedFromForm;

  // Ранний выход после всех хуков
  if (oneOfVariants.length === 0) return null;

  const selectedVariantIndex = selectedVariantName
    ? oneOfVariants.findIndex((v) => v.name === selectedVariantName)
    : -1;
  const selectedVariant =
    selectedVariantIndex >= 0 ? oneOfVariants[selectedVariantIndex] : undefined;

  // Обработчик выбора варианта
  const handleVariantSelect = (variantName: string) => {
    // Обновляем локальное состояние ручного выбора
    setManuallySelectedVariant(variantName);

    // Очищаем все варианты
    oneOfVariants.forEach((variant, index) => {
      variantFields[index].input.onChange(undefined);
    });

    // Устанавливаем начальное значение для выбранного варианта
    const variantIndex = oneOfVariants.findIndex((v) => v.name === variantName);
    if (variantIndex >= 0) {
      const variant = oneOfVariants[variantIndex];
      const variantType = variant.type?.type;

      let initialValue: unknown = variant.default;
      if (initialValue === undefined) {
        // Проверяем one_of у варианта ДО проверки типа
        // Если вариант имеет one_of, инициализируем как пустой объект
        if (variant.one_of && variant.one_of.length > 0) {
          initialValue = {};
        } else if (variantType === 'string') {
          initialValue = '';
        } else if (variantType === 'integer' || variantType === 'double') {
          initialValue = '';
        } else if (variantType === 'boolean') {
          initialValue = 'undefined';
        } else if (variantType === 'array') {
          initialValue = [];
        } else if (variantType === 'kv' || variantType === 'struct') {
          initialValue = {};
        } else {
          initialValue = '';
        }
      }
      variantFields[variantIndex].input.onChange(initialValue);
    }
  };

  // Рендерим поля выбранного варианта напрямую
  const renderVariantFields = () => {
    if (!selectedVariant || selectedVariantIndex < 0) return null;

    const variantFieldName = fieldNamePrefix
      ? `${fieldNamePrefix}.${selectedVariant.name}`
      : selectedVariant.name || '';
    const variantType = selectedVariant.type;

    // Проверяем one_of у варианта ДО проверки типа
    // Вариант может не иметь type, но иметь one_of (вложенный one_of)
    if (selectedVariant.one_of && selectedVariant.one_of.length > 0) {
      return (
        <OneOfEdit
          param={selectedVariant}
          fieldNamePrefix={variantFieldName}
          level={level + 1}
        />
      );
    }

    // Для struct - рендерим все его поля напрямую
    if (
      variantType?.type === 'struct' &&
      variantType.struct_params &&
      variantType.struct_params.length > 0
    ) {
      return (
        <ParamStructEdit
          fieldName={variantFieldName}
          structParams={variantType.struct_params}
          level={level}
        />
      );
    }

    // Для массива структур
    if (
      variantType?.type === 'array' &&
      variantType.nested_type === 'struct' &&
      variantType.struct_params
    ) {
      return (
        <ParamArrayStructEdit
          fieldName={variantFieldName}
          structParams={variantType.struct_params}
          level={level}
          required={selectedVariant.required}
        />
      );
    }

    // Для массива примитивов
    if (variantType?.type === 'array' && variantType.nested_type) {
      return (
        <ParamFieldArray
          fieldName={variantFieldName}
          required={selectedVariant.required}
          nestedType={variantType.nested_type}
          constraint={variantType.type_constraint as TypeConstraint | undefined}
        />
      );
    }

    // Для kv
    if (variantType?.type === 'kv') {
      // KV со структурами
      if (
        variantType.nested_type === 'struct' &&
        variantType.struct_params &&
        variantType.struct_params.length > 0
      ) {
        return (
          <ParamFieldKVStruct
            fieldName={variantFieldName}
            structParams={variantType.struct_params}
            level={level}
            required={selectedVariant.required}
          />
        );
      }

      // KV с примитивами
      return (
        <ParamFieldKV
          fieldName={variantFieldName}
          required={selectedVariant.required}
          nestedType={variantType.nested_type}
          constraint={variantType.type_constraint as TypeConstraint | undefined}
        />
      );
    }

    // Примитивные типы
    const typeConstraint = variantType?.type_constraint as
      | TypeConstraint
      | undefined;

    switch (variantType?.type) {
      case 'boolean':
        return (
          <PrimitiveBoolean
            fieldName={variantFieldName}
            size="s"
            required={selectedVariant.required}
          />
        );
      case 'integer':
        return (
          <PrimitiveNumber
            fieldName={variantFieldName}
            size={size}
            required={selectedVariant.required}
            type="integer"
            constraint={typeConstraint}
            placeholder={`Enter ${selectedVariant.name}`}
          />
        );
      case 'double':
        return (
          <PrimitiveNumber
            fieldName={variantFieldName}
            size={size}
            required={selectedVariant.required}
            type="double"
            constraint={typeConstraint}
            placeholder={`Enter ${selectedVariant.name}`}
          />
        );
      case 'string':
      default:
        return (
          <PrimitiveString
            fieldName={variantFieldName}
            size={size}
            required={selectedVariant.required}
            constraint={typeConstraint}
            placeholder={`Enter ${selectedVariant.name}`}
          />
        );
    }
  };

  return (
    <FieldDisclosure
      name={param.name || ''}
      required={param.required}
      description={param.description}
      defaultValue={param.default}
      type="one_of"
      defaultExpanded={defaultExpanded && level <= maxExpandedLevel}
      selectedVariant={selectedVariantName}
    >
      <Select
        value={selectedVariantName ? [selectedVariantName] : []}
        onUpdate={(values) => {
          if (values[0]) {
            handleVariantSelect(values[0]);
          }
        }}
        placeholder="Select variant"
        size={size}
        width="max"
      >
        {oneOfVariants.map((variant) => (
          <Select.Option key={variant.name} value={variant.name || ''}>
            {variant.name}
          </Select.Option>
        ))}
      </Select>
      {renderVariantFields()}
    </FieldDisclosure>
  );
}

// ============================================================================
// Компонент для редактирования одного параметра
// ============================================================================

interface ParamItemEditProps {
  param: ParamsDC;
  fieldName: string;
  level: number;
  disclosure?: boolean;
  defaultOpen?: boolean;
}

function ParamItemEdit({
  param,
  fieldName,
  level,
  disclosure = false,
  defaultOpen = false,
}: ParamItemEditProps): React.ReactElement | null {
  const {
    size,
    defaultExpanded,
    maxExpandedLevel = 2,
    focusedParam,
  } = useFormParamEditContext();

  const paramName = param.name || '';
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

  // Получаем значение поля для подсчёта элементов
  const field = useField(fieldName, { subscription: { value: true } });
  const fieldValue = field.input.value;

  // Проверяем, является ли это SourceName или OutputName в Resharder.InputSources
  const isResharderSourceName =
    paramName === 'SourceName' &&
    fieldName.startsWith('Resharder.InputSources[') &&
    fieldName.endsWith('.SourceName');

  const isResharderOutputName =
    paramName === 'OutputName' &&
    fieldName.startsWith('Resharder.InputSources[') &&
    fieldName.endsWith('.OutputName');

  const isResharderField = isResharderSourceName || isResharderOutputName;

  // Получаем доступ к форме и InputSources для обработки SourceName/OutputName
  const form = useForm();
  const inputSourcesField = useField('Resharder.InputSources', {
    subscription: { value: true },
  });
  const inputSources =
    (inputSourcesField.input.value as
      | Array<{ SourceName?: string; OutputName?: string; portHash?: string }>
      | undefined) || [];

  // Получаем индекс из fieldName (например, "Resharder.InputSources[0].SourceName" -> 0)
  const sourceIndexMatch = isResharderField
    ? fieldName.match(/\[(\d+)\]/)
    : null;
  const sourceIndex = sourceIndexMatch ? parseInt(sourceIndexMatch[1], 10) : -1;
  const currentSource =
    sourceIndex >= 0 ? inputSources[sourceIndex] : undefined;

  // Создаем обработчик onBlur для SourceName в Resharder.InputSources
  // Логика:
  // 1. Если SourceName пустое — генерируем resh_hash4
  // 2. Если SourceName не уникальное и у него есть уникальный OutputName — ничего не меняем
  // 3. Если SourceName не уникальное и нет OutputName — создаём OutputName с hash
  const handleSourceNameBlur = useCallback(() => {
    if (!isResharderSourceName || sourceIndex < 0 || !currentSource?.portHash) {
      return;
    }

    const currentValue = fieldValue as string | undefined;
    const trimmedName = (currentValue || '').trim();

    const portHash = currentSource.portHash;
    const hash4 = portHash.substring(5, 9); // Берем 4 символа после "port_"

    // Если имя пустое — генерируем resh_hash4
    if (!trimmedName) {
      const generatedName = `resh_${hash4}`;
      form.change(fieldName, generatedName);
      return;
    }

    // Проверяем на дубликаты SourceName среди других элементов InputSources
    const isDuplicateSourceName = inputSources.some(
      (source, idx) =>
        idx !== sourceIndex && source?.SourceName?.trim() === trimmedName,
    );

    if (isDuplicateSourceName) {
      // Проверяем, есть ли у текущего элемента уникальный OutputName
      const currentOutputName = currentSource.OutputName?.trim();
      if (currentOutputName) {
        // Собираем все имена для проверки уникальности OutputName
        const allDisplayNames = inputSources
          .filter((_, idx) => idx !== sourceIndex)
          .map((source) => {
            const outputName = source.OutputName?.trim();
            return outputName || source.SourceName?.trim() || '';
          })
          .filter(Boolean);

        const isOutputNameUnique = !allDisplayNames.includes(currentOutputName);
        if (isOutputNameUnique) {
          // OutputName уникален — ничего не меняем
          return;
        }
      }

      // OutputName отсутствует или не уникален — создаём новый OutputName с hash
      const outputFieldName = fieldName.replace('.SourceName', '.OutputName');
      const uniqueOutputName = `${trimmedName}_${hash4}`;
      form.change(outputFieldName, uniqueOutputName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentSource?.portHash,
    currentSource?.OutputName,
    fieldValue,
    inputSources,
    sourceIndex,
  ]);

  // Создаем обработчик onBlur для OutputName в Resharder.InputSources
  // Логика:
  // 1. Если OutputName пустое — ничего не делаем (будет использоваться SourceName)
  // 2. Собираем массив имён: OutputName (если есть) или SourceName для каждого элемента
  // 3. Если OutputName не уникально в этом массиве — добавляем hash
  const handleOutputNameBlur = useCallback(() => {
    if (!isResharderOutputName || sourceIndex < 0 || !currentSource?.portHash) {
      return;
    }

    const currentValue = fieldValue as string | undefined;
    const trimmedName = (currentValue || '').trim();

    // Если OutputName пустое — ничего не делаем
    if (!trimmedName) {
      return;
    }

    const portHash = currentSource.portHash;
    const hash4 = portHash.substring(5, 9); // Берем 4 символа после "port_"

    // Собираем все отображаемые имена (OutputName || SourceName) кроме текущего элемента
    const allDisplayNames = inputSources
      .filter((_, idx) => idx !== sourceIndex)
      .map((source) => {
        const outputName = source.OutputName?.trim();
        return outputName || source.SourceName?.trim() || '';
      })
      .filter(Boolean);

    // Проверяем уникальность текущего OutputName
    const isDuplicate = allDisplayNames.includes(trimmedName);

    if (isDuplicate) {
      // Добавляем _hash4 к имени
      const uniqueName = `${trimmedName}_${hash4}`;
      form.change(fieldName, uniqueName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSource?.portHash, fieldValue, inputSources, sourceIndex]);

  // Вычисляем количество элементов только для массивов и kv (не для struct)
  const itemsCount = useMemo(() => {
    if (paramType === 'array') {
      return Array.isArray(fieldValue) ? fieldValue.length : 0;
    }

    if (paramType === 'kv') {
      if (
        fieldValue &&
        typeof fieldValue === 'object' &&
        !Array.isArray(fieldValue)
      ) {
        return Object.keys(fieldValue).length;
      }
      return 0;
    }

    return undefined;
  }, [paramType, fieldValue]);

  const renderContent = (): React.ReactNode => {
    // Обработка массивов
    if (paramType === 'array' && nestedType) {
      // Массив структур - используем специальный компонент
      if (nestedType === 'struct' && structParams) {
        return (
          <ParamArrayStructEdit
            fieldName={fieldName}
            structParams={structParams}
            level={level}
            required={required}
          />
        );
      }

      // Массив примитивов
      return (
        <ParamFieldArray
          fieldName={fieldName}
          required={required}
          nestedType={nestedType}
          constraint={typeConstraint}
        />
      );
    }

    // Обработка key-value
    if (paramType === 'kv') {
      // KV со структурами - используем специальный компонент
      if (nestedType === 'struct' && structParams) {
        return (
          <ParamFieldKVStruct
            fieldName={fieldName}
            structParams={structParams}
            level={level}
            required={required}
          />
        );
      }

      // KV с примитивами
      return (
        <ParamFieldKV
          fieldName={fieldName}
          required={required}
          nestedType={nestedType}
          constraint={typeConstraint}
        />
      );
    }

    // Обработка структур
    if (paramType === 'struct') {
      if (!structParams || structParams.length === 0) {
        return null;
      }

      return (
        <ParamStructEdit
          fieldName={fieldName}
          structParams={structParams}
          level={level}
        />
      );
    }

    // Обработка custom типа (редактирование через модальное окно)
    if (paramType === 'custom') {
      return (
        <CustomParamValueEdit
          paramName={paramName}
          fieldName={fieldName}
          fieldValue={fieldValue}
        />
      );
    }

    // Обработка multiline строк (если есть constraint с multiline или type)
    // Важно: обрабатываем до enum и примитивных типов, чтобы использовать disclosure
    if (isMultilineString) {
      return (
        <MultilineTextArea
          fieldName={fieldName}
          validate={validators.build({ required })}
          placeholder={`Enter ${paramName}`}
          size={size}
          constraintType={typeConstraint?.string_type}
        />
      );
    }

    // Обработка enum
    if (typeConstraint?.enum) {
      return (
        <PrimitiveString
          fieldName={fieldName}
          size={size}
          required={required}
          constraint={typeConstraint}
          placeholder={`Select ${paramName}`}
        />
      );
    }

    // Обработка примитивных типов
    switch (paramType) {
      case 'boolean':
        return (
          <PrimitiveBoolean
            fieldName={fieldName}
            size="s"
            required={required}
          />
        );
      case 'integer':
        return (
          <PrimitiveNumber
            fieldName={fieldName}
            size={size}
            required={required}
            type="integer"
            constraint={typeConstraint}
            placeholder={`Enter ${paramName}`}
          />
        );
      case 'double':
        return (
          <PrimitiveNumber
            fieldName={fieldName}
            size={size}
            required={required}
            type="double"
            constraint={typeConstraint}
            placeholder={`Enter ${paramName}`}
          />
        );
      case 'string':
      default: {
        // Специальная обработка Worker.GraphConfig.Name:
        // допускаем пустое значение во время редактирования,
        // но на blur, если значение пустое, генерируем Worker_hash4
        const isWorkerGraphConfigName =
          paramName === 'Name' && fieldName === 'Worker.GraphConfig.Name';

        const handleWorkerGraphConfigNameBlur = isWorkerGraphConfigName
          ? () => {
              const currentValue = (fieldValue as string | undefined) || '';
              if (currentValue.trim()) {
                return;
              }
              const newName = `Worker_${generateHash(4)}`;
              form.change(fieldName, newName);
            }
          : undefined;

        // Определяем обработчик onBlur
        const getOnBlurHandler = () => {
          if (isResharderSourceName) {
            return handleSourceNameBlur;
          }
          if (isResharderOutputName) {
            return handleOutputNameBlur;
          }
          return handleWorkerGraphConfigNameBlur;
        };

        return (
          <PrimitiveString
            fieldName={fieldName}
            size={size}
            required={required}
            constraint={typeConstraint}
            placeholder={`Enter ${paramName}`}
            onBlur={getOnBlurHandler()}
          />
        );
      }
    }
  };

  // Ранний выход для disclosure на первом уровне
  if (level === 1 && disclosure && isComplexType) {
    // Если есть focusedParam — контролируем раскрытие извне
    const isControlled = focusedParam !== null && focusedParam !== undefined;
    const isFocused = focusedParam === paramName;

    return (
      <ParamDisclosure
        title={paramName}
        defaultExpanded={isControlled ? undefined : defaultOpen}
        expanded={isControlled ? isFocused : undefined}
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
    // Ограничиваем глубину раскрытия до maxExpandedLevel
    // defaultExpanded применяется только для уровней <= maxExpandedLevel
    const shouldExpand = defaultExpanded && level <= maxExpandedLevel;
    return (
      <FieldDisclosure
        name={paramName}
        required={required}
        description={description}
        defaultValue={defaultValue}
        typeConstraint={typeConstraint}
        type={paramType}
        nestedType={nestedType}
        defaultExpanded={shouldExpand}
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

export const FormParamEdit: React.FC<FormParamEditProps> = ({
  params,
  fieldNamePrefix = '',
  level = 1,
  size = 'm',
  addButtonVariant = 'outlined',
  disclosure = false,
  defaultOpen = false,
  defaultExpanded = false,
  maxExpandedLevel = 2,
  focusedParam = null,
  variableNames,
  arrayStructAddDisabledPaths,
}) => {
  const addDisabledSet = useMemo(() => {
    if (!arrayStructAddDisabledPaths?.length) {
      return undefined;
    }
    return new Set(arrayStructAddDisabledPaths);
  }, [arrayStructAddDisabledPaths]);

  const contextValue = useMemo(
    () => ({
      addButtonVariant,
      size,
      defaultExpanded,
      maxExpandedLevel,
      focusedParam,
      variableNames,
      arrayStructAddDisabledPaths: addDisabledSet,
    }),
    [
      addButtonVariant,
      size,
      defaultExpanded,
      maxExpandedLevel,
      focusedParam,
      variableNames,
      addDisabledSet,
    ],
  );

  if (!params || params.length === 0) {
    return null;
  }

  return (
    <FormParamEditContext.Provider value={contextValue}>
      <Flex direction="column" gap={3}>
        {params.map((param) => {
          const paramName = param.name || '';
          const fieldName = fieldNamePrefix
            ? `${fieldNamePrefix}.${paramName}`
            : paramName;
          const paramType = param.type?.type || 'string';

          // Для one_of используем специальную обработку
          // Значения вариантов сохраняются напрямую в форму (без обёртки в param.name)
          if (param.one_of && param.one_of.length > 0) {
            return (
              <OneOfEdit
                key={paramName}
                param={param}
                fieldNamePrefix={fieldNamePrefix}
                level={level}
              />
            );
          }

          // Для сложных типов на первом уровне с disclosure
          const itemTypeConstraint = param.type?.type_constraint as
            | TypeConstraint
            | undefined;
          const isItemMultiline =
            paramType === 'string' && isMultilineConstraint(itemTypeConstraint);
          if (
            level === 1 &&
            disclosure &&
            (paramType === 'struct' ||
              paramType === 'array' ||
              paramType === 'kv' ||
              paramType === 'custom' ||
              isItemMultiline)
          ) {
            return (
              <ParamItemEdit
                key={paramName}
                param={param}
                fieldName={fieldName}
                level={level}
                disclosure
                defaultOpen={defaultOpen}
              />
            );
          }

          return (
            <ParamItemEdit
              key={paramName}
              param={param}
              fieldName={fieldName}
              level={level}
            />
          );
        })}
      </Flex>
    </FormParamEditContext.Provider>
  );
};
