import { ArrowRotateRight } from '@gravity-ui/icons';
import {
  Flex,
  Table,
  Text,
  Dialog,
  configure,
  Lang,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect } from 'react';

import { projectPageModel } from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ErrorMessage } from '@/modules/control-plane/shared/components';
import {
  ButtonWithProgress,
} from '@/modules/control-plane/shared/ui';
import { getPipeStatusColor } from '@/modules/control-plane/shared/utils/getStatusColor';
import { GlobalLoader } from '@/shared/ui/loaders';

interface JobsTabProps {
  experiment_id: number;
}

function buildSupervisorModelDescription(
  m: controlPlaneApi.dc.ResponsesSupervisorModelJobDC,
): string {
  const blocks: string[] = [];
  if (m.error_message?.trim()) {
    blocks.push(m.error_message.trim());
  }
  if (m.start_time?.trim()) {
    blocks.push(`Время начала: ${m.start_time.trim()}`);
  }
  if (m.end_time?.trim()) {
    blocks.push(`Время окончания: ${m.end_time.trim()}`);
  }
  if (blocks.length === 0) {
    return 'Супервизор не передал отдельного описания для этой модели. При ошибке выполнения здесь появится текст ошибки.';
  }
  return blocks.join('\n\n');
}

function buildSupervisorJobsFallback(
  run?: controlPlaneApi.dc.ResponsesSupervisorExperimentRunDC,
): controlPlaneApi.dc.ResponsesSupervisorModelJobDC[] {
  if (!run) return [];
  if ((run.jobs?.length ?? 0) > 0) return run.jobs ?? [];

  const total = run.total_models ?? 0;
  const currentOrder = run.current_order ?? 0;
  if (total <= 0) return [];

  const runtimeStatus = String(run.status || '').toUpperCase();
  const rows: controlPlaneApi.dc.ResponsesSupervisorModelJobDC[] = [];
  for (let i = 1; i <= total; i++) {
    let status = 'PENDING';
    if (runtimeStatus === 'COMPLETED') {
      status = 'COMPLETED';
    } else if (runtimeStatus === 'FAILED') {
      status =
        i < currentOrder ? 'COMPLETED' : i === currentOrder ? 'FAILED' : 'PENDING';
    } else if (runtimeStatus === 'RUNNING' || runtimeStatus === 'QUEUED') {
      status =
        i < currentOrder
          ? 'COMPLETED'
          : i === currentOrder
            ? runtimeStatus
            : 'PENDING';
    }

    rows.push({
      index: i,
      model_name:
        i === currentOrder ? run.current_model || `stage-${i}` : `stage-${i}`,
      status,
      error_message:
        i === currentOrder && runtimeStatus === 'FAILED' ? run.detail : undefined,
    });
  }
  return rows;
}

export const JobsTab = ({ experiment_id }: JobsTabProps) => {
  const [pipeStatusLoad, pipeStatusLoading, pipeStatusData, pipeStatusReset] =
    useUnit([
      projectPageModel.experiment.status.load,
      projectPageModel.experiment.status.$loading,
      projectPageModel.experiment.status.$data,
      projectPageModel.experiment.status.reset,
    ]);
  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const [supervisorModelDetail, setSupervisorModelDetail] =
    React.useState<controlPlaneApi.dc.ResponsesSupervisorModelJobDC | null>(
      null,
    );

  useEffect(() => {
    pipeStatusLoad(experiment_id);
    return () => {
      pipeStatusReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment_id]);

  const onRefresh = () => {
    if (pipeStatusLoading) return;
    pipeStatusLoad(experiment_id);
  };

  if (pipeStatusLoading && !pipeStatusData)
    return (
      <Flex style={{ height: '100%', width: '100%', position: 'relative' }}>
        <GlobalLoader absolute size="m" />
      </Flex>
    );
  if (!pipeStatusData)
    return (
      <ErrorMessage reload={() => pipeStatusLoad(experiment_id)} />
    );

  const supervisorRun = pipeStatusData?.supervisor;
  const supervisorJobs = buildSupervisorJobsFallback(supervisorRun);
  const dockerShareError =
    (supervisorRun?.detail || '').includes('Mounts denied') ||
    supervisorJobs.some((j) => (j.error_message || '').includes('Mounts denied'));
  const supervisorJobColumns = [
    {
      id: 'idx',
      name: '#',
      width: 56,
      align: 'center' as const,
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => (
        <Flex alignItems="center" justifyContent="center">
          {item.index ?? '—'}
        </Flex>
      ),
    },
    {
      id: 'model',
      name: 'Модель',
      width: 220,
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => (
        <Text variant="body-2">{item.model_name || '—'}</Text>
      ),
    },
    {
      id: 'st',
      name: 'Статус',
      width: 140,
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => {
        const st = (item.status || 'UNKNOWN').toUpperCase();
        const color =
          st === 'COMPLETED'
            ? getPipeStatusColor('OK')
            : st === 'FAILED'
              ? getPipeStatusColor('ERROR')
              : st === 'RUNNING' || st === 'QUEUED'
                ? getPipeStatusColor('PENDING')
                : getPipeStatusColor('UNKNOWN');
        return (
          <Text variant="body-2" color={color}>
            {item.status || '—'}
          </Text>
        );
      },
    },
    {
      id: 'err',
      name: 'Ошибка',
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => (
        <Text variant="body-2" color={item.error_message ? 'danger' : undefined}>
          {item.error_message || '—'}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Flex
        gapRow={3}
        style={{
          paddingBottom: '12px',
          flexShrink: 0,
          boxShadow: 'inset 0 -1px 0 0 var(--g-color-line-generic)',
        }}
      >
        <ButtonWithProgress
          view="normal"
          size="m"
          loading={pipeStatusLoading}
          onClick={onRefresh}
          intervalMs={10000}
          style={{
            boxShadow: '0 2px 6px 0 var(--g-color-sfx-shadow)',
          }}
        >
          <ButtonWithProgress.Icon>
            <ArrowRotateRight />
          </ButtonWithProgress.Icon>
          Обновить
        </ButtonWithProgress>
      </Flex>
      {supervisorRun ? (
        <Flex direction="column" gap={3} style={{ marginBottom: 16 }}>
          <Text variant="subheader-2">Этапы пайплайна (супервизор)</Text>
          <Flex direction="row" gap={4} style={{ flexWrap: 'wrap' }}>
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-2" color="secondary">
                Состояние:
              </Text>
              <Text
                variant="body-2"
                color={getPipeStatusColor(pipeStatusData?.status || 'UNKNOWN')}
              >
                {supervisorRun.status || pipeStatusData?.status || '—'}
              </Text>
            </Flex>
            {supervisorRun.progress ? (
              <Text variant="body-2" color="secondary">
                Прогресс этапов: {supervisorRun.progress}
              </Text>
            ) : null}
            {supervisorRun.current_model ? (
              <Text variant="body-2" color="secondary">
                Текущая модель: {supervisorRun.current_model}
              </Text>
            ) : null}
          </Flex>
          {dockerShareError ? (
            <Text variant="body-2" color="warning">
              Ошибка Docker File Sharing: добавьте путь проекта в Docker Desktop
              (Settings - Resources - File Sharing), затем перезапустите
              java-supervisor и повторите запуск.
            </Text>
          ) : null}
          {supervisorJobs.length > 0 ? (
            <Table
              columns={supervisorJobColumns}
              data={supervisorJobs}
              emptyMessage="Нет этапов"
              className="table--full-width sf-table--row-clickable"
              onRowClick={(item) => setSupervisorModelDetail(item)}
            />
          ) : (
            <Text variant="body-2" color="secondary">
              Список этапов пуст (ожидайте данные от супервизора или проверьте
              orch_id).
            </Text>
          )}
        </Flex>
      ) : null}
      <Dialog
        open={supervisorModelDetail !== null}
        onClose={() => setSupervisorModelDetail(null)}
        size="m"
        className="sf-dialog"
      >
        <Dialog.Header
          caption={supervisorModelDetail?.model_name || 'Модель'}
        />
        <Dialog.Body>
          {supervisorModelDetail ? (
            <Flex direction="column" gap={3}>
              <Flex direction="row" gap={2} alignItems="baseline">
                <Text variant="body-2" color="secondary">
                  №
                </Text>
                <Text variant="body-2">{supervisorModelDetail.index ?? '—'}</Text>
              </Flex>
              <Flex direction="row" gap={2} alignItems="baseline">
                <Text variant="body-2" color="secondary">
                  Статус
                </Text>
                <Text variant="body-2">
                  {supervisorModelDetail.status || '—'}
                </Text>
              </Flex>
              <Text variant="subheader-2">Описание</Text>
              <Text
                variant="body-2"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {buildSupervisorModelDescription(supervisorModelDetail)}
              </Text>
            </Flex>
          ) : null}
        </Dialog.Body>
      </Dialog>
    </div>
  );
};
