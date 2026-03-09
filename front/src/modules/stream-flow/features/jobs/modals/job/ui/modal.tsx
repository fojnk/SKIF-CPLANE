import {
  ArrowRotateRight,
  CircleCheck,
  CircleExclamation,
  CircleXmark,
  Clock,
} from '@gravity-ui/icons';
import {
  Dialog,
  Flex,
  SegmentedRadioGroup,
  SegmentedRadioGroupOption,
  Tab,
  TabList,
  TabProvider,
  Text,
  Icon,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, {
  useEffect,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';

import {
  ShowJobModel,
  JobModalProps,
} from '@/modules/stream-flow/features/jobs/modals/job/';
import { JobsStatusLabel } from '@/modules/stream-flow/pages/project/ui/components';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorMessage } from '@/modules/stream-flow/shared/components';
import { JobsDCStatus } from '@/modules/stream-flow/shared/types';
import {
  ButtonWithProgress,
  FullDate,
  LogViewer,
  VkUser,
} from '@/modules/stream-flow/shared/ui';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

type TextByValueProps = {
  title: string;
  text?: string;
};

const TextByValue = ({ title, text }: TextByValueProps) => {
  return <Text>{`${title}: ${text ? text : 'Отсутствует'}`}</Text>;
};

const IconByStatus = (status?: string) => {
  switch (status) {
    case 'completed':
      return (
        <Icon
          data={CircleCheck}
          size={21}
          style={{ color: 'var(--g-color-base-positive-heavy)' }}
        />
      );
    case 'running':
      return (
        <Icon
          data={Clock}
          size={21}
          style={{ color: 'var(--g-color-base-info-heavy-hover)' }}
        />
      );
    case 'waiting':
    case 'queued':
    case 'pending':
      return (
        <Icon
          data={CircleExclamation}
          size={21}
          style={{ color: 'var(--g-color-base-info-heavy-hover)' }}
        />
      );
    case 'failed':
    case 'canceled':
    default:
      return (
        <Icon
          data={CircleXmark}
          size={21}
          style={{ color: 'var(--g-color-base-danger-heavy)' }}
        />
      );
  }
};

enum tabsEnum {
  info = 'info',
  logs = 'logs',
}

const tabListItems = [{ name: tabsEnum.info }, { name: tabsEnum.logs }];

interface StageViewProps {
  content?: string;
  stage?: streamFlowApi.dc.JobdJobDC;
  activeTab?: tabsEnum;
  setActiveTab: Dispatch<SetStateAction<tabsEnum | undefined>>;
}

function StageView(props: StageViewProps) {
  return (
    <TabProvider
      value={props.activeTab}
      onUpdate={(tab) => {
        props.setActiveTab(tab as tabsEnum);
      }}
    >
      <TabList>
        {tabListItems.map((item) => (
          <Tab key={item.name} value={item.name}>
            {item.name}
          </Tab>
        ))}
      </TabList>
    </TabProvider>
  );
}

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<JobModalProps>) => {
  const [data, loading, failed] = useUnit([
    ShowJobModel.$data,
    ShowJobModel.$loading,
    ShowJobModel.$failed,
  ]);

  const activeRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState<string | undefined>();
  const [activeElement, setActiveElement] = useState<
    streamFlowApi.dc.JobdStageDC | undefined
  >();
  const [activeTab, setActiveTab] = useState<tabsEnum | undefined>(
    tabsEnum.logs,
  );

  const loadData = useCallback(() => {
    if (payload.id) {
      ShowJobModel.load(payload.id);
    }
  }, [payload.id]);

  useEffect(() => {
    if (payload.id) {
      loadData();
    }
    return () => ShowJobModel.reset();
  }, [payload.id, loadData]);

  useEffect(() => {
    setActiveElement(
      data?.job?.stages?.find((stage) => stage.step_id?.toString() === active),
    );
  }, [active, data]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [active]);

  const renderRadioGroup = () => {
    if (loading && !data) {
      return (
        <Flex
          direction="column"
          style={{ position: 'relative', height: '110px' }}
        >
          <GlobalLoader size="m" absolute />
        </Flex>
      );
    }

    if (failed) {
      return (
        <Flex
          direction="column"
          alignItems="center"
          style={{ position: 'relative', height: '200px' }}
        >
          <ErrorMessage reload={loadData} />
        </Flex>
      );
    }

    if (data && data.job && data.job.stages && data.job.stages.length > 0) {
      if (!active) {
        setActive(
          payload.step_id
            ? `${payload.step_id}`
            : `${data.job.stages[0].step_id}`,
        );
      }
      return (
        <Flex>
          <SegmentedRadioGroup
            style={{ overflowX: 'auto', paddingBottom: '15px' }}
            onUpdate={setActive}
            size="l"
            defaultValue={active}
          >
            {data.job.stages.map((stage) => {
              return (
                <SegmentedRadioGroupOption
                  key={stage.step_id}
                  value={`${stage.step_id}`}
                  content={
                    <Flex
                      gap={2}
                      alignItems="center"
                      ref={active === `${stage.step_id}` ? activeRef : null}
                    >
                      <Text>{stage?.name}</Text>
                      {IconByStatus(stage.step_status)}
                    </Flex>
                  }
                />
              );
            })}
          </SegmentedRadioGroup>
        </Flex>
      );
    }
  };

  const renderActiveTab = () => {
    if (!active || failed) return;

    return (
      <Flex direction="column" gap={4}>
        <StageView activeTab={activeTab} setActiveTab={setActiveTab} />
        <Flex direction="row">
          <ButtonWithProgress
            view="normal"
            size="m"
            loading={loading}
            onClick={loadData}
            intervalMs={5000}
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
      </Flex>
    );
  };

  const renderBody = () => {
    if ((!data && loading) || failed) return;
    if (activeTab === tabsEnum.logs) {
      return <LogViewer content={activeElement?.logs || ''} />;
    }
    if (activeTab === tabsEnum.info) {
      return (
        <Flex direction="column" gap={2}>
          <Flex>
            {TextByValue({
              title: 'Название',
              text: activeElement?.name,
            })}
          </Flex>
          <Flex gap={1} alignItems="center">
            Статус:
            {JobsStatusLabel({
              status: activeElement?.step_status as JobsDCStatus,
            })}
            {IconByStatus(activeElement?.step_status)}
          </Flex>
          <Flex>
            {TextByValue({
              title: 'Описание',
              text: activeElement?.description,
            })}
          </Flex>
        </Flex>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={reset}
      size="l"
      className="sf-dialog variable-dialog"
    >
      <Dialog.Header
        caption={
          <Flex gap={4} alignItems="center">
            <Text variant="header-1">{data?.job?.name}</Text>
            <Flex gap={4} alignItems="end" style={{ marginLeft: 'auto' }}>
              <FullDate date={data?.job?.created_at} />
              <VkUser size="body-2" user={data?.job?.created_by} />
            </Flex>
          </Flex>
        }
      />
      <Dialog.Body>
        <Flex
          direction="column"
          gap={4}
          style={{
            width: '100%',
            height: '100%',
            paddingBottom: '18px',
          }}
        >
          {renderRadioGroup()}
          {renderActiveTab()}
          {renderBody()}
        </Flex>
      </Dialog.Body>
    </Dialog>
  );
};
