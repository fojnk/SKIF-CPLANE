import { CircleQuestion, TrashBin } from '@gravity-ui/icons';
import {
  Dialog,
  Flex,
  Text,
  Button,
  Select,
  Table,
  withTableActions,
  Switch,
  TextInput,
  Tooltip,
  Icon,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useState } from 'react';

import {
  projectPageModel,
  severity,
} from '@/modules/stream-flow/pages/project';
import { AlertStatusLabel } from '@/modules/stream-flow/pages/project/ui/components';

type localAlertType = {
  limit: string;
  has_limit: boolean;
  severity: string;
  severity_is_active: boolean;
  alert_template_id: string;
  delay_firing: string;
  delay_resolving: string;
  template_index?: number;
  type_limit?: string;
};

const TableRender = withTableActions<localAlertType>(Table);

type SelectedAlerts = Record<string, localAlertType>;

export const ModalEditAlert = ({
  experiment_id,
  project_id,
  template_id,
}: {
  experiment_id: number;
  project_id: string;
  template_id: string;
}) => {
  const [alertsListV2, templateListV2, alertsEdit] = useUnit([
    projectPageModel.project.alerts.alertsListV2,
    projectPageModel.project.alerts.alertsOptionsListV2,
    projectPageModel.project.alerts.alertsEdit,
  ]);

  const currentTemplate = React.useMemo(() => {
    return templateListV2?.alert_templates.find(
      (template) => `${template.alert_template_id}` === template_id,
    );
  }, [templateListV2, template_id]);

  const graphicName = React.useMemo(() => {
    if (!alertsListV2) return undefined;

    const found = alertsListV2.alerts.find(
      (alert) =>
        alert.alerts.length > 0 &&
        `${alert.alerts[0].alert_template_id}` === template_id,
    );
    return found?.alert_name;
  }, [alertsListV2, template_id]);

  const [selectedSeverity, setSelectedSeverity] = useState<string[]>(() => {
    if (!alertsListV2) {
      return Object.values(severity);
    }

    const foundGroup = alertsListV2.alerts.find(
      (alert) =>
        alert.alerts.length > 0 &&
        `${alert.alerts[0].alert_template_id}` === template_id,
    );

    if (foundGroup) {
      return foundGroup.alerts.map((alert) => alert.severity);
    } else {
      return Object.values(severity);
    }
  });

  const [selected, setSelected] = useState<SelectedAlerts>(() => {
    const result: SelectedAlerts = {};

    if (!alertsListV2) {
      Object.values(severity).forEach((sev) => {
        result[sev] = {
          template_index: 0,
          limit: '',
          has_limit: currentTemplate?.has_limit || false,
          severity: sev,
          severity_is_active: false,
          alert_template_id: template_id,
          delay_firing: '',
          delay_resolving: '',
          type_limit: currentTemplate?.type_limit,
        };
      });
      return result;
    }

    const foundGroup = alertsListV2.alerts.find(
      (alert) =>
        alert.alerts.length > 0 &&
        `${alert.alerts[0].alert_template_id}` === template_id,
    );

    if (foundGroup) {
      foundGroup.alerts.forEach((alert) => {
        result[alert.severity] = {
          limit: alert.limit,
          has_limit: alert.has_limit,
          severity: alert.severity,
          severity_is_active: alert.severity_is_active,
          alert_template_id: template_id,
          delay_firing: alert.delay_firing ?? '',
          delay_resolving: alert.delay_resolving ?? '',
          type_limit: currentTemplate?.type_limit,
        };
      });
    } else {
      Object.values(severity).forEach((sev) => {
        result[sev] = {
          limit: '',
          has_limit: currentTemplate?.has_limit || false,
          severity: sev,
          severity_is_active: false,
          alert_template_id: template_id,
          delay_firing: '',
          delay_resolving: '',
          type_limit: currentTemplate?.type_limit,
        };
      });
    }

    return result;
  });

  const tableData = React.useMemo(() => {
    return selectedSeverity
      .filter((severity) => selected[severity])
      .map((severity, index) => ({
        ...selected[severity],
        template_index: index,
      }));
  }, [selectedSeverity, selected]);

  const switchHandler = (severity: string, value: boolean) => {
    setSelected((prev) => ({
      ...prev,
      [severity]: {
        ...prev[severity],
        severity_is_active: value,
      },
    }));
  };

  const limitHandler = (severity: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [severity]: {
        ...prev[severity],
        limit: value,
      },
    }));
  };

  const firingHandler = (severity: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [severity]: {
        ...prev[severity],
        delay_firing: value,
      },
    }));
  };

  const resolvingHandler = (severity: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [severity]: {
        ...prev[severity],
        delay_resolving: value,
      },
    }));
  };

  const severityHandler = (value: string[]) => {
    setSelectedSeverity(value);

    setSelected((prev) => {
      const newSelected = { ...prev };
      value.forEach((sev) => {
        if (!newSelected[sev]) {
          newSelected[sev] = {
            limit: '',
            has_limit: currentTemplate?.has_limit || false,
            severity: sev,
            severity_is_active: false,
            alert_template_id: template_id,
            delay_firing: '',
            delay_resolving: '',
            type_limit: currentTemplate?.type_limit,
          };
        }
      });
      return newSelected;
    });
  };

  const removeButtonHandler = (severity: string) => {
    setSelectedSeverity((prev) => prev.filter((s) => s !== severity));

    setSelected((prev) => {
      const newSelected = { ...prev };
      delete newSelected[severity];
      return newSelected;
    });
  };

  const submitButtonHandler = () => {
    alertsEdit({
      experiment_id,
      product_id: Number(project_id),
      alert_rules: Object.values(selected).map((alert) => {
        return {
          alert_template_id: Number(alert.alert_template_id),
          delay_firing: alert.delay_firing,
          delay_resolving: alert.delay_resolving,
          limit: alert.limit,
          severity: alert.severity,
          severity_is_active: alert.severity_is_active,
        };
      }),
    });
  };
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
              switchHandler(item.severity, value);
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
                          {templateListV2?.type_limits[limit]?.description}
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
      template: (item: localAlertType) => {
        return (
          <Tooltip
            openDelay={0}
            content={
              <Flex direction="column" gap={1}>
                <Text>Type - {item?.type_limit}:</Text>
                <Text>
                  {
                    templateListV2?.type_limits[item.type_limit as string]
                      ?.description
                  }
                </Text>
              </Flex>
            }
          >
            <TextInput
              size="m"
              disabled={!item.has_limit}
              value={item.limit}
              onUpdate={(value) => {
                limitHandler(item.severity, value);
              }}
            />
          </Tooltip>
        );
      },
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
            value={item.delay_firing}
            onUpdate={(value) => {
              firingHandler(item.severity, value);
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
            value={item.delay_resolving}
            onUpdate={(value) => {
              resolvingHandler(item.severity, value);
            }}
          />
        </Tooltip>
      ),
      meta: { selectedAlways: true },
    },
  ];

  return (
    <>
      <Dialog.Header
        caption={
          <Flex gap={4} direction="column">
            <Flex>
              <Text variant="header-2">Current product id: {project_id}</Text>
            </Flex>
            <Tooltip
              content={currentTemplate?.alert_description}
              openDelay={50}
            >
              <Flex alignItems="center" gap={1} style={{ cursor: 'pointer' }}>
                <Text variant="header-1">Template: {graphicName}</Text>
                <Icon data={CircleQuestion} size={18} />
              </Flex>
            </Tooltip>
          </Flex>
        }
      />
      <Dialog.Body>
        <Flex direction="column" gap={10}>
          <Select
            value={selectedSeverity}
            onUpdate={(value) => {
              severityHandler(value);
            }}
            multiple
            placeholder="Severity"
            size="m"
          >
            {Object.values(severity).map((sev) => (
              <Select.Option key={sev} value={sev}>
                {sev}
              </Select.Option>
            ))}
          </Select>

          <TableRender
            columns={columns}
            emptyMessage="Alerts list empty"
            className="table--full-width custom-actions-table"
            data={tableData}
            renderRowActions={(data) => {
              return (
                <Button
                  onClick={() => {
                    removeButtonHandler(data.item.severity);
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
      </Dialog.Body>
      <Dialog.Footer>
        <Flex style={{ marginLeft: 'auto' }}>
          <Button view="action" size="l" onClick={submitButtonHandler}>
            Save
          </Button>
        </Flex>
      </Dialog.Footer>
    </>
  );
};
