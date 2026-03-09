import { CircleQuestion, TrashBin } from '@gravity-ui/icons';
import {
  Flex,
  Select,
  Text,
  Switch,
  Button,
  Tooltip,
  TextInput,
  Dialog,
  Table,
  withTableActions,
  Icon,
  useToaster,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import './style.css';
import {
  projectPageModel,
  severity,
} from '@/modules/stream-flow/pages/project';
import { AlertStatusLabel } from '@/modules/stream-flow/pages/project/ui/components';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { GlobalLoader } from '@/shared/ui/loaders';

type localAlertType = {
  limit: string;
  has_limit: boolean;
  severity: string;
  severity_is_active: boolean;
  template_index: number;
  delay_firing: string;
  delay_resolving: string;
  severity_index: number;
  type_limit: string;
  template_id: number;
};

const TableRender = withTableActions<localAlertType>(Table);

const DEFAULT_SEVERITY_DATA = Object.values(severity).reduce(
  (acc, severityType) => ({
    ...acc,
    [severityType]: {
      severity_is_active: false,
      delay_firing: '',
      delay_resolving: '',
      limit: '',
    },
  }),
  {} as {
    [key: string]: {
      severity_is_active: boolean;
      delay_firing: string;
      delay_resolving: string;
      limit: string;
    };
  },
);

export const ModalCreateAlert = ({
  experiment_id,
  project_id,
}: {
  experiment_id: number;
  project_id: string;
}) => {
  const [alertsListV2, templateListV2, alertsCreate, alertsCreateLoading] =
    useUnit([
      projectPageModel.project.alerts.alertsListV2,
      projectPageModel.project.alerts.alertsOptionsListV2,
      projectPageModel.project.alerts.alertsCreateLoadV2,
      projectPageModel.project.alerts.alertsCreateLoadingV2,
    ]);

  const { add } = useToaster();

  const [productId, setProductId] = useState<string>(project_id);
  const [select, setSelect] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (streamFlowApi.dc.ResponsesAlertTemplateResponseDC & {
      severity: string[];
      severityData: {
        [key: string]: {
          severity_is_active: boolean;
          delay_firing: string;
          delay_resolving: string;
          limit: string;
        };
      };
    })[]
  >([]);

  const filteredTemplateList = useMemo(() => {
    if (!templateListV2?.alert_templates) return [];

    if (!project_id) {
      return templateListV2.alert_templates;
    }

    const usedIds = new Set<number>();

    alertsListV2?.alerts?.forEach((graphic) => {
      graphic.alerts?.forEach((alert) => {
        if (alert.alert_template_id != null) {
          usedIds.add(alert.alert_template_id);
        }
      });
    });

    return templateListV2.alert_templates.filter(
      (template) => !usedIds.has(template.alert_template_id),
    );
  }, [alertsListV2, templateListV2, project_id]);

  useEffect(() => {
    if (!templateListV2?.alert_templates || select.length === 0) {
      setSelectedTemplate([]);
      return;
    }

    const selectedIds = new Set(select);

    const newTemplates = templateListV2.alert_templates
      .filter((item) => selectedIds.has(`${item?.alert_name}`))
      .map((alert) => {
        const existingTemplate = selectedTemplate.find(
          (t) => `${t.alert_name}` === `${alert.alert_name}`,
        );

        if (existingTemplate) {
          return existingTemplate;
        }

        return {
          ...alert,
          severity: [],
          severityData: { ...DEFAULT_SEVERITY_DATA },
        };
      });

    if (
      newTemplates.length !== selectedTemplate.length ||
      !newTemplates.every(
        (t, i) =>
          t.alert_template_id === selectedTemplate[i]?.alert_template_id,
      )
    ) {
      setSelectedTemplate(newTemplates);
    }
  }, [select, templateListV2, selectedTemplate]);

  const updateTemplate = (
    templateId: number,
    updates: Partial<
      streamFlowApi.dc.ResponsesAlertTemplateResponseDC & {
        severity: string[];
        severityData: {
          [key: string]: {
            severity_is_active: boolean;
            delay_firing: string;
            delay_resolving: string;
            limit: string;
          };
        };
      }
    >,
  ) => {
    setSelectedTemplate((prev) =>
      prev.map((template) =>
        template.alert_template_id === templateId
          ? { ...template, ...updates }
          : template,
      ),
    );
  };

  const availableTemplates = () => {
    if (!filteredTemplateList.length) {
      return null;
    }

    return (
      <Flex>
        <Select
          multiple
          filterable
          value={select}
          onUpdate={setSelect}
          placeholder="Select template"
          width={600}
        >
          {filteredTemplateList.map((template, i) => (
            <Select.Option
              key={`${template?.graphic_name} ${template.alert_name} ${i}`}
              value={`${template?.alert_name}`}
            >
              <Flex alignItems="center" height="100%" gap={2}>
                <Text>{template?.alert_name}</Text>
                <Tooltip content={template.alert_description} openDelay={0}>
                  <Icon data={CircleQuestion} />
                </Tooltip>
              </Flex>
            </Select.Option>
          ))}
        </Select>
      </Flex>
    );
  };

  const switchHandler = ({
    templateIndex,
    severity,
    value,
  }: {
    templateIndex: number;
    severity: string;
    value: boolean;
  }) => {
    const templateId = selectedTemplate[templateIndex].alert_template_id;
    updateTemplate(templateId, {
      severityData: {
        ...selectedTemplate[templateIndex].severityData,
        [severity]: {
          ...selectedTemplate[templateIndex].severityData[severity],
          severity_is_active: value,
        },
      },
    });
  };

  const severityHandler = ({
    templateIndex,
    value,
  }: {
    templateIndex: number;
    value: string[];
  }) => {
    const templateId = selectedTemplate[templateIndex].alert_template_id;
    updateTemplate(templateId, { severity: value });
  };

  const limitHandler = ({
    value,
    templateIndex,
    severity,
  }: {
    value: string;
    templateIndex: number;
    severity: string;
  }) => {
    const templateId = selectedTemplate[templateIndex].alert_template_id;
    updateTemplate(templateId, {
      severityData: {
        ...selectedTemplate[templateIndex].severityData,
        [severity]: {
          ...selectedTemplate[templateIndex].severityData[severity],
          limit: value,
        },
      },
    });
  };

  const firingHandler = ({
    value,
    templateIndex,
    severity,
  }: {
    value: string;
    templateIndex: number;
    severity: string;
  }) => {
    const templateId = selectedTemplate[templateIndex].alert_template_id;
    updateTemplate(templateId, {
      severityData: {
        ...selectedTemplate[templateIndex].severityData,
        [severity]: {
          ...selectedTemplate[templateIndex].severityData[severity],
          delay_firing: value,
        },
      },
    });
  };

  const resolvingHandler = ({
    value,
    templateIndex,
    severity,
  }: {
    value: string;
    templateIndex: number;
    severity: string;
  }) => {
    const templateId = selectedTemplate[templateIndex].alert_template_id;
    updateTemplate(templateId, {
      severityData: {
        ...selectedTemplate[templateIndex].severityData,
        [severity]: {
          ...selectedTemplate[templateIndex].severityData[severity],
          delay_resolving: value,
        },
      },
    });
  };

  const removeButtonHandler = ({
    templateIndex,
    severityValue,
  }: {
    templateIndex: number;
    severityValue: string;
  }) => {
    const templateId = selectedTemplate[templateIndex].alert_template_id;

    const updatedSeverities = selectedTemplate[templateIndex].severity.filter(
      (severity) => severity !== severityValue,
    );

    updateTemplate(templateId, {
      severity: updatedSeverities,
    });
  };

  const removeTemplateHandler = (templateId: number) => {
    setSelectedTemplate((prev) =>
      prev.filter((template) => template.alert_template_id !== templateId),
    );

    setSelect((prev) =>
      prev.filter((item) => {
        const template = templateListV2?.alert_templates?.find(
          (t) => t.alert_template_id === templateId,
        );
        return item !== `${template?.alert_name}`;
      }),
    );
  };

  const submitButtonHandler = () => {
    if (alertsCreateLoading) return;

    const alerts = selectedTemplate.flatMap((template) => {
      return template.severity.map((severity) => ({
        ...template.severityData[severity],
        alert_template_id: template.alert_template_id,
        severity,
      }));
    });

    if (alerts.length < 1) {
      add({
        name: 'create-error',
        title: 'Add alerts',
        autoHiding: 3000,
      });
      return;
    }

    if (
      alerts.some((alert) => {
        const currentTemplate = templateListV2?.alert_templates?.find(
          (template) => template.alert_template_id === alert.alert_template_id,
        );

        if (currentTemplate?.has_limit && alert.limit === '') {
          return alert.limit === '';
        }

        return false;
      })
    ) {
      add({
        name: 'create-error',
        title: 'Limit field cannot be empty',
        autoHiding: 3000,
      });
      return;
    }

    const payload = {
      experiment_id,
      product_id: Number(productId),
      alert_rules: alerts,
    };
    alertsCreate(payload);
  };

  const selectedTemplateRender = () => {
    if (!selectedTemplate.length) {
      return null;
    }

    const columns = [
      {
        id: 'severity',
        name: 'Severity',
        template: (item: localAlertType) => (
          <Flex alignItems="center" gap={8}>
            <AlertStatusLabel status={item.severity} />
          </Flex>
        ),
        meta: { selectedAlways: true },
      },
      {
        id: 'enabled',
        name: 'Enabled',
        template: (item: localAlertType) => (
          <Flex>
            <Switch
              checked={item.severity_is_active}
              onUpdate={(value) => {
                if (item.template_index !== undefined) {
                  switchHandler({
                    templateIndex: item.template_index,
                    severity: item.severity,
                    value,
                  });
                }
              }}
            />
          </Flex>
        ),
        meta: { selectedAlways: true },
      },
      {
        id: 'limit',
        name: () => {
          return (
            <Flex alignItems="center" gap={1}>
              <Text>Limit</Text>
              <Tooltip
                openDelay={0}
                content={
                  <Flex direction="column" gap={1}>
                    {templateListV2?.type_limits &&
                      Object.keys(templateListV2?.type_limits).map((limit) => {
                        return (
                          <div key={`${limit}`}>
                            {limit}:{' '}
                            {templateListV2?.type_limits[limit].description}
                          </div>
                        );
                      })}
                  </Flex>
                }
              >
                <Icon size={16} data={CircleQuestion} />
              </Tooltip>
            </Flex>
          );
        },
        template: (item: localAlertType) => (
          <Tooltip
            openDelay={0}
            content={
              <Flex direction="column" gap={1}>
                <Text>Type - {item.type_limit}:</Text>
                <Text>
                  {
                    templateListV2?.type_limits[item.type_limit as string]
                      .description
                  }
                </Text>
              </Flex>
            }
          >
            <TextInput
              placeholder={item.type_limit}
              size="m"
              disabled={item.has_limit}
              value={item.limit}
              onUpdate={(value) => {
                if (item.template_index !== undefined) {
                  limitHandler({
                    templateIndex: item.template_index,
                    value,
                    severity: item.severity,
                  });
                }
              }}
            />
          </Tooltip>
        ),
        width: 160,
        minWidth: 160,
        meta: { selectedAlways: true },
      },
      {
        id: 'delay_firing',
        name: () => {
          return (
            <Flex alignItems="center" gap={1}>
              <Text>Delay firing</Text>
              <Tooltip
                openDelay={0}
                content={
                  <Flex direction="column" gap={1}>
                    {templateListV2?.delay_firing && (
                      <Text>{templateListV2.delay_firing.description}</Text>
                    )}
                  </Flex>
                }
              >
                <Icon size={16} data={CircleQuestion} />
              </Tooltip>
            </Flex>
          );
        },
        template: (item: localAlertType) => (
          <Tooltip
            openDelay={0}
            content={
              <Flex direction="column" gap={1}>
                <Text>Delay firing:</Text>
                <Text>{templateListV2?.delay_firing.description}</Text>
              </Flex>
            }
          >
            <TextInput
              size="m"
              placeholder="0s"
              value={item.delay_firing}
              onUpdate={(value) => {
                if (item.template_index !== undefined) {
                  firingHandler({
                    templateIndex: item.template_index,
                    value,
                    severity: item.severity,
                  });
                }
              }}
            />
          </Tooltip>
        ),
        meta: { selectedAlways: true },
      },
      {
        id: 'delay_resolving',
        name: () => {
          return (
            <Flex alignItems="center" gap={1}>
              <Text>Delay resolving</Text>
              <Tooltip
                openDelay={0}
                content={
                  <Flex direction="column" gap={1}>
                    {templateListV2?.delay_resolving && (
                      <Text>{templateListV2.delay_resolving.description}</Text>
                    )}
                  </Flex>
                }
              >
                <Icon size={16} data={CircleQuestion} />
              </Tooltip>
            </Flex>
          );
        },
        template: (item: localAlertType) => (
          <Tooltip
            openDelay={0}
            content={
              <Flex direction="column" gap={1}>
                <Text>Delay resolving:</Text>
                <Text>{templateListV2?.delay_resolving.description}</Text>
              </Flex>
            }
          >
            <TextInput
              size="m"
              placeholder="0s"
              value={item.delay_resolving}
              onUpdate={(value) => {
                if (item.template_index !== undefined) {
                  resolvingHandler({
                    templateIndex: item.template_index,
                    value,
                    severity: item.severity,
                  });
                }
              }}
            />
          </Tooltip>
        ),
        meta: { selectedAlways: true },
      },
    ];

    return (
      <Flex direction="column" gap={10}>
        {selectedTemplate.map((template, templateIndex) => (
          <Flex
            direction="column"
            gap={4}
            key={`${template.alert_template_id}_${templateIndex}`}
          >
            <Flex gap={4} alignItems="center">
              <Tooltip content={template.alert_description} openDelay={0}>
                <Flex
                  style={{ cursor: 'pointer' }}
                  justifyContent="center"
                  alignItems="center"
                  gap={1}
                >
                  <Text variant="header-1" style={{ userSelect: 'none' }}>
                    {`${template.alert_name}`}
                  </Text>
                  <Icon data={CircleQuestion} size={18} />
                </Flex>
              </Tooltip>

              <Select
                multiple
                value={template.severity}
                placeholder="Severity"
                size="l"
                onUpdate={(value) => {
                  severityHandler({
                    templateIndex,
                    value,
                  });
                }}
              >
                {Object.values(severity).map((sev) => (
                  <Select.Option key={sev} value={sev}>
                    <Text>{sev}</Text>
                  </Select.Option>
                ))}
              </Select>
              <Button
                size="m"
                view="outlined-danger"
                onClick={() =>
                  removeTemplateHandler(template.alert_template_id)
                }
              >
                <Button.Icon>
                  <TrashBin />
                </Button.Icon>
              </Button>
            </Flex>
            <TableRender
              key={`${template.alert_template_id}_${template.severity.length}`}
              emptyMessage="Alerts list empty"
              columns={columns}
              data={template.severity.map((severity, index) => {
                return {
                  template_index: templateIndex,
                  severity,
                  severity_is_active:
                    template.severityData[severity].severity_is_active,
                  has_limit: Boolean(!template.has_limit),
                  limit: template.severityData[severity].limit,
                  delay_firing: template.severityData[severity].delay_firing,
                  delay_resolving:
                    template.severityData[severity].delay_resolving,
                  severity_index: index,
                  type_limit: template.type_limit,
                  template_id: template.alert_template_id,
                };
              })}
              className="table--full-width custom-actions-table"
              renderRowActions={(data) => {
                return (
                  <Button
                    view="outlined-danger"
                    disabled={alertsCreateLoading}
                    onClick={() => {
                      removeButtonHandler({
                        templateIndex,
                        severityValue: data.item.severity,
                      });
                    }}
                  >
                    <Button.Icon>
                      <TrashBin />
                    </Button.Icon>
                  </Button>
                );
              }}
            />
          </Flex>
        ))}
      </Flex>
    );
  };

  return (
    <>
      <Dialog.Header
        caption={
          <Flex gap={8} justifyContent="center" direction="column">
            {project_id ? (
              <Flex>
                <Text variant="header-2">
                  Select alerts for id {project_id}:
                </Text>
              </Flex>
            ) : (
              <Flex gap={4} alignItems="center">
                <Text variant="header-2">Enter product ID:</Text>
                <Flex>
                  <TextInput
                    size="m"
                    placeholder="Product id"
                    value={productId}
                    onUpdate={setProductId}
                  />
                </Flex>
              </Flex>
            )}
            {availableTemplates()}
          </Flex>
        }
      />
      {alertsCreateLoading && <GlobalLoader absolute />}
      <Dialog.Body>{selectedTemplateRender()}</Dialog.Body>
      <Dialog.Footer>
        <Flex style={{ marginLeft: 'auto' }}>
          <Button
            view="action"
            size="l"
            onClick={submitButtonHandler}
            disabled={alertsCreateLoading}
          >
            Save
          </Button>
        </Flex>
      </Dialog.Footer>
    </>
  );
};
