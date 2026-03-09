import {
  TrashBin,
  Pencil,
  Check,
  Xmark,
  CircleQuestion,
  ArrowUpRightFromSquare,
} from '@gravity-ui/icons';
import { RenderRowActionsProps } from '@gravity-ui/table';
import {
  Button,
  Disclosure,
  Flex,
  Link,
  Table,
  Text,
  withTableActions,
  Icon,
  Select,
  Label,
  Tooltip,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react/effector-react.umd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './alerts-tab.css';

import { ShowAlertsModal } from '@/modules/stream-flow/features/alerts/modals/alert';
import { ActionConfirmModel } from '@/modules/stream-flow/features/dialogs';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { AlertStatusLabel } from '@/modules/stream-flow/pages/project/ui/components';
import { ErrorMessage } from '@/modules/stream-flow/shared/components';
import { getNovaAlertsLink } from '@/modules/stream-flow/shared/utils/getNovaLink';
import { GlobalLoader } from '@/shared/ui/loaders';

const TableRender = withTableActions<localAlertType>(Table);

interface AlertsTabProps {
  experiment_id: number;
}

type localAlertType = {
  alert_template_id: number;
  delay_firing?: string;
  delay_resolving?: string;
  limit: string;
  rule_id: number;
  severity: string;
  severity_is_active: boolean;
  graphic_name: string;
  has_limit: boolean;
  type_limit: string;
};

const RowAction = ({
  data,
  alert_group_id,
  onDelete,
}: {
  data: RenderRowActionsProps<localAlertType>;
  experiment_id: number;
  product_id: string;
  alert_group_id?: number;
  onDelete: (item: localAlertType) => void;
}) => {
  if (!alert_group_id) {
    return <div />;
  }
  return (
    <Button
      view="outlined-danger"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(data.item);
      }}
    >
      <Button.Icon>
        <TrashBin />
      </Button.Icon>
    </Button>
  );
};

interface AlertsListItemProps {
  experiment_id: number;
  product_id?: string;
}

const AlertsListItem = ({ experiment_id, product_id }: AlertsListItemProps) => {
  const [alertsListV2, alertsRemoveV2, alertsOptionsListV2, alertsListLoading] =
    useUnit([
      projectPageModel.project.alerts.alertsListV2,
      projectPageModel.project.alerts.alertsRemoveLoadV2,
      projectPageModel.project.alerts.alertsOptionsListV2,
      projectPageModel.project.alerts.alertsListLoadingV2,
    ]);

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
          {item.severity_is_active ? (
            <Label theme="success" icon={<Check />} />
          ) : (
            <Label theme="danger" icon={<Xmark />} />
          )}
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
                  {alertsOptionsListV2?.type_limits &&
                    Object.keys(alertsOptionsListV2?.type_limits).map(
                      (limit) => {
                        return (
                          <div key={`${limit}`}>
                            {limit}:{' '}
                            {
                              alertsOptionsListV2?.type_limits[limit]
                                .description
                            }
                          </div>
                        );
                      },
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
              <Text>Type - {item.type_limit}:</Text>
              <Text>
                {
                  alertsOptionsListV2?.type_limits[item.type_limit as string]
                    .description
                }
              </Text>
            </Flex>
          }
        >
          <Text>{item.limit}</Text>
        </Tooltip>
      ),
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
                  {alertsOptionsListV2?.delay_firing && (
                    <Text>{alertsOptionsListV2.delay_firing.description}</Text>
                  )}
                </Flex>
              }
            >
              <Icon size={16} data={CircleQuestion} />
            </Tooltip>
          </Flex>
        );
      },
      template: (item: localAlertType) => <Text>{item.delay_firing}</Text>,
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
                  {alertsOptionsListV2?.delay_resolving && (
                    <Text>
                      {alertsOptionsListV2.delay_resolving.description}
                    </Text>
                  )}
                </Flex>
              }
            >
              <Icon size={16} data={CircleQuestion} />
            </Tooltip>
          </Flex>
        );
      },
      template: (item: localAlertType) => <Text>{item.delay_resolving}</Text>,
      meta: { selectedAlways: true },
    },
  ];

  const modalEditAlertHandler = (alert_template_id: number) => {
    if (!alert_template_id) {
      return;
    }
    ShowAlertsModal.start({
      type: 'edit',
      project_id: product_id || '',
      experiment_id,
      alert_template_id: `${alert_template_id}`,
    });
  };

  const deleteAlertsGroupByTemplate = useCallback(
    (rule_ids: number[]) => {
      if (!alertsListV2?.alert_group_id) return;
      alertsRemoveV2({
        experiment_id,
        product_id: Number(product_id),
        deleting_rules: rule_ids,
        alert_group_id: alertsListV2?.alert_group_id,
      });
    },
    [alertsListV2?.alert_group_id, experiment_id, product_id, alertsRemoveV2],
  );

  const deleteSingleRule = useCallback(
    (item: {
      experiment_id: number;
      product_id: number;
      alert_group_id: number;
      deleting_rules: number[];
    }) => {
      alertsRemoveV2(item);
    },
    [alertsRemoveV2],
  );

  useEffect(() => {
    const unsubscribe = ActionConfirmModel.confirmed.watch((payload) => {
      if (payload.mode === 'delete') {
        if (payload.meta?.rules) {
          deleteAlertsGroupByTemplate(payload.meta.rules as number[]);
        } else if (payload.meta?.item) {
          deleteSingleRule(payload.meta.item as any);
        }
      }
    });
    return () => unsubscribe();
  }, [deleteAlertsGroupByTemplate, deleteSingleRule]);

  const removeHandler = ({
    alerts,
    name,
  }: {
    alerts: number[];
    name: string;
  }) => {
    ActionConfirmModel.start({
      mode: 'delete',
      name,
      meta: {
        rules: alerts,
      },
    });
  };

  if (!product_id) return null;

  if ((!alertsListV2 || !alertsListV2.alerts) && !alertsListLoading) {
    return (
      <Flex
        alignItems="center"
        justifyContent="center"
        style={{ paddingTop: '20px' }}
      >
        <Text variant="header-2">Alerts list empty</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={6} style={{ width: '100%' }}>
      {alertsListV2?.alerts?.map((alertGroup) => {
        return (
          <Flex gap={4} key={alertGroup.alert_name} style={{ width: '100%' }}>
            <Disclosure
              defaultExpanded
              arrowPosition="start"
              className="full_width"
            >
              <Disclosure.Summary>
                {(_props, defaultButton) => {
                  return (
                    <Flex gap={2}>
                      {defaultButton}
                      <Flex
                        gap={4}
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Flex gap={4}>
                          <Text
                            variant="header-1"
                            style={{ userSelect: 'none' }}
                          >
                            {alertGroup.alert_name}
                          </Text>
                          <Text color="secondary">
                            ({alertGroup.alerts.length} rules)
                          </Text>
                        </Flex>
                      </Flex>
                      <Flex style={{ padding: '0 calc(0.25rem*3)' }} gap={2}>
                        <Button
                          size="m"
                          onClick={(e) => {
                            e.stopPropagation();
                            modalEditAlertHandler(
                              alertGroup.alerts[0].alert_template_id,
                            );
                          }}
                        >
                          <Button.Icon>
                            <Pencil />
                          </Button.Icon>
                        </Button>
                        <Button
                          view="outlined-danger"
                          size="m"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHandler({
                              alerts: alertGroup.alerts.map(
                                (alert) => alert.rule_id,
                              ),
                              name: alertGroup.alert_name,
                            });
                          }}
                        >
                          <Button.Icon>
                            <TrashBin />
                          </Button.Icon>
                        </Button>
                      </Flex>
                    </Flex>
                  );
                }}
              </Disclosure.Summary>
              <div style={{ marginTop: 18 }} />
              <TableRender
                key={`table-${alertGroup.alert_name}`}
                data={alertGroup.alerts}
                columns={columns}
                emptyMessage="Alerts list empty"
                className="table--full-width"
                renderRowActions={(data) => (
                  <RowAction
                    data={data}
                    experiment_id={experiment_id}
                    product_id={product_id}
                    alert_group_id={alertsListV2?.alert_group_id}
                    onDelete={(item) => {
                      ActionConfirmModel.start({
                        mode: 'delete',
                        name: `${item.severity} in ${item.graphic_name}`,
                        meta: {
                          item: {
                            experiment_id,
                            product_id: Number(product_id),
                            alert_group_id: alertsListV2?.alert_group_id,
                            deleting_rules: [item.rule_id],
                          },
                        },
                      });
                    }}
                  />
                )}
              />
            </Disclosure>
          </Flex>
        );
      })}
    </Flex>
  );
};

export const AlertsTab = ({ experiment_id }: AlertsTabProps) => {
  const [
    alertsListLoadV2,
    alertsListLoadingV2,
    alertsListV2,
    alertsListFailedV2,
    alertsListResetV2,
    alertsOptionsListLoadV2,
    alertsOptionsListV2,
    alertsOptionsListLoadingV2,
    alertsProductListLoad,
    alertsProductList,
    alertsProductListLoading,
    alertsLastCreatedProductId,
  ] = useUnit([
    projectPageModel.project.alerts.alertsListLoadV2,
    projectPageModel.project.alerts.alertsListLoadingV2,
    projectPageModel.project.alerts.alertsListV2,
    projectPageModel.project.alerts.alertsListFailedV2,
    projectPageModel.project.alerts.alertsListResetV2,
    projectPageModel.project.alerts.alertsOptionsListLoadV2,
    projectPageModel.project.alerts.alertsOptionsListV2,
    projectPageModel.project.alerts.alertsOptionsListLoadingV2,
    projectPageModel.project.alerts.alertsProductsLoad,
    projectPageModel.project.alerts.alertsProductsData,
    projectPageModel.project.alerts.alertsProductsLoading,
    projectPageModel.project.alerts.alertsCreateLastCreatedProductIdV2,
  ]);
  const [productId, setProductId] = useState<string[] | null>(null);

  const loadHandler = useCallback(() => {
    if (!productId) return;
    alertsListLoadV2({
      product_id: Number(productId[0]),
      experiment_id,
    });
  }, [alertsListLoadV2, experiment_id, productId]);

  const modalCreateAlertHandler = () => {
    ShowAlertsModal.start({
      type: 'create',
      project_id: (productId && productId[0]) || '',
      experiment_id,
    });
  };

  const modalCreateProductHandler = () => {
    ShowAlertsModal.start({
      type: 'create',
      experiment_id,
    });
  };

  const novaLink = useMemo(() => {
    return productId && productId[0] ? getNovaAlertsLink(productId[0]) : '';
  }, [productId]);

  useEffect(() => {
    alertsOptionsListLoadV2();
    alertsProductListLoad({ experiment_id });
    setProductId(null);
    return () => {
      alertsListResetV2();
    };
  }, [
    experiment_id,
    alertsListResetV2,
    alertsOptionsListLoadV2,
    alertsProductListLoad,
  ]);

  useEffect(() => {
    if (!alertsProductList) {
      return;
    }
    loadHandler();
  }, [alertsProductList, loadHandler]);

  useEffect(() => {
    if (
      (!productId || productId[0] !== alertsLastCreatedProductId) &&
      alertsLastCreatedProductId
    ) {
      setProductId([alertsLastCreatedProductId]);
    }
  }, [alertsLastCreatedProductId, productId]);

  return (
    <Flex direction="column" gap={4}>
      {(alertsListLoadingV2 || alertsOptionsListLoadingV2) && (
        <GlobalLoader absolute />
      )}
      <Flex alignItems="center" gap={6}>
        <Text>Alerts for product ID</Text>
        <Flex>
          {!alertsProductListLoading && alertsProductList && (
            <Select
              filterable
              value={productId ?? []}
              onUpdate={setProductId}
              width={130}
              placeholder="Select product"
              renderPopup={({ renderList }) => {
                return (
                  <>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      style={{ paddingTop: '4px' }}
                    >
                      <Button
                        style={{ width: '80%' }}
                        onClick={() => {
                          modalCreateProductHandler();
                        }}
                      >
                        <Text>Add product</Text>
                      </Button>
                    </Flex>
                    {renderList()}
                  </>
                );
              }}
            >
              {alertsProductList.map((product, i) => (
                <Select.Option key={`${product} ${i}`} value={`${product}`}>
                  {product}
                </Select.Option>
              ))}
            </Select>
          )}
        </Flex>
        <Link
          href="https://docs.vk.team/control-plane/docs/monitoring/alerts.html"
          target="_blank"
          view="normal"
        >
          Как подключить оповещение?
        </Link>
        {alertsListV2 &&
          alertsListV2?.alerts &&
          alertsListV2?.alerts?.length > 0 && (
            <Button
              href={novaLink}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!novaLink}
            >
              Nova link
              <Button.Icon>
                <Icon data={ArrowUpRightFromSquare} />
              </Button.Icon>
            </Button>
          )}
        {alertsOptionsListV2 && alertsListV2 && (
          <Button view="action" onClick={modalCreateAlertHandler}>
            Add new alerts
          </Button>
        )}
      </Flex>
      {alertsListFailedV2 && !alertsListLoadingV2 && (
        <ErrorMessage
          message="Failed to retrieve data"
          reload={loadHandler}
          danger
        />
      )}
      {productId && (
        <AlertsListItem
          product_id={productId[0] ?? ''}
          experiment_id={experiment_id}
        />
      )}
    </Flex>
  );
};
