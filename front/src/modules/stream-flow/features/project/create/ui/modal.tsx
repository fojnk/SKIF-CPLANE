import { Dialog, Flex, Link, Text, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Form } from 'react-final-form';

import {
  CreateForm,
  ProjectCreateModel,
} from '@/modules/stream-flow/features/project/create';
import { NamespacesError } from '@/modules/stream-flow/pages/namespaces/ui/components';
import { AclRightDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import { NamespaceSelector } from '@/modules/stream-flow/shared/components';
import { NamespaceDC } from '@/modules/stream-flow/shared/types';
import { SfDialogFooter } from '@/modules/stream-flow/shared/ui';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

import { CreateProjectForm } from './components';

const filterNamespaces = (namespaces: NamespaceDC[]): NamespaceDC[] => {
  return namespaces.filter((namespace) =>
    namespace.rights?.includes(AclRightDC.RightCreateProject),
  );
};

export const Modal = ({ open, onClose, reset }: ModalViewProps) => {
  const isTesting = import.meta.env.VITE_TESTING === 'true';
  const [pending, createProject, data, loading, error] = useUnit([
    ProjectCreateModel.$pending,
    ProjectCreateModel.createProject,
    ProjectCreateModel.$data,
    ProjectCreateModel.$loading,
    ProjectCreateModel.$error,
  ]);
  const [search, setSearch] = useState('');
  const [namespace, setNamespace] = useState<NamespaceDC | null>(null);
  const [isRestoringNamespace, setIsRestoringNamespace] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  const filteredNS = useMemo(() => {
    return data ? filterNamespaces(data) : [];
  }, [data]);

  const handleSetNamespace = (newNamespace: NamespaceDC) => {
    setNamespace(newNamespace);
    if (newNamespace) {
      setToStorage({
        key: 'sf-selected-namespace',
        value: newNamespace.id!,
        type: 'local',
      });
    }
  };

  const handleResetNamespace = () => {
    setNamespace(null);
  };

  useEffect(() => {
    if (!hasCheckedStorage && data) {
      setHasCheckedStorage(true);
      if (filteredNS.length > 0) {
        const savedNamespaceId = getFromStorage<number>({
          key: 'sf-selected-namespace',
          type: 'local',
        });
        if (savedNamespaceId) {
          const savedNamespace = filteredNS.find(
            (ns) => ns.id === savedNamespaceId,
          );
          if (savedNamespace) {
            setIsRestoringNamespace(true);
            setNamespace(savedNamespace);
          }
        }
      }
    }
  }, [filteredNS, data, hasCheckedStorage]);

  useEffect(() => {
    if (namespace && isRestoringNamespace) {
      setIsRestoringNamespace(false);
    }
  }, [namespace, isRestoringNamespace]);

  const handleSubmit = (form: CreateForm) => {
    if (namespace) {
      createProject({
        ...form,
        namespace_id: namespace.id!,
      });
    }
  };

  const renderFooter = (
    type: 'close' | 'submit',
    submitProps?: { disabled: boolean; onSubmit: () => void },
  ) => {
    if (type === 'close') {
      return (
        <Dialog.Footer
          preset="success"
          textButtonCancel="Отмена"
          propsButtonCancel={{
            view: 'outlined',
            type: 'button',
            size: 'l',
            onClick: () => onClose(),
          }}
        />
      );
    }

    return (
      <SfDialogFooter
        disabled={submitProps!.disabled}
        onClose={onClose}
        onSubmit={submitProps!.onSubmit}
        pending={pending}
        textApply="Создать"
      />
    );
  };

  const renderContent = () => {
    // 1. ЗАГРУЗКА
    if (loading || isRestoringNamespace || !hasCheckedStorage) {
      return (
        <>
          <Dialog.Header caption="Новый проект" />
          <Dialog.Body>
            <Flex
              direction="column"
              style={{ position: 'relative', height: '264px' }}
            >
              <GlobalLoader absolute size="m" />
            </Flex>
          </Dialog.Body>
          {renderFooter('close')}
        </>
      );
    }

    // 2. ОШИБКА
    if (error) {
      return (
        <>
          <Dialog.Header caption="Новый проект" />
          <Dialog.Body>
            <Flex
              direction="column"
              style={{ position: 'relative', height: '264px' }}
            >
              <NamespacesError error={error} />
            </Flex>
          </Dialog.Body>
          {renderFooter('close')}
        </>
      );
    }

    // 3. НЕТ ДОСТУПНЫХ НЕЙМСПЕЙСОВ
    if (filteredNS.length === 0) {
      return (
        <>
          <Dialog.Header caption="Новый проект" />
          <Dialog.Body>
            <Flex
              direction="column"
              style={{ position: 'relative', height: '190px' }}
            >
              <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                gap={2}
                style={{ height: '100%' }}
              >
                <Text variant="subheader-2" style={{ textAlign: 'center' }}>
                  У вас нет прав на <br />
                  создание проектов ни в одном рабочем пространстве.
                </Text>
                <Text variant="body-1" color="secondary">
                  Пожалуйста, запросите{' '}
                  <Link
                    href={
                      isTesting
                        ? 'https://access.vkteam.ru/order/create/system/?permission_source=information_system&resource=79959&product=784906'
                        : 'https://access.vkteam.ru/order/create/system/?permission_source=&resource=79196&category=79451'
                    }
                    target="_blank"
                  >
                    доступ к рабочему пространству
                  </Link>
                </Text>
              </Flex>
            </Flex>
          </Dialog.Body>
          {renderFooter('close')}
        </>
      );
    }

    // 4. ФОРМА СОЗДАНИЯ ПРОЕКТА (неймспейс выбран)
    if (namespace) {
      return (
        <Form onSubmit={handleSubmit}>
          {({ handleSubmit, invalid }) => (
            <form onSubmit={handleSubmit} name="sf-prj-create">
              <Dialog.Header caption="Новый проект" />
              <Dialog.Body>
                <CreateProjectForm
                  namespace={namespace.name ?? 'без названия'}
                  resetNamespace={handleResetNamespace}
                />
              </Dialog.Body>
              {renderFooter('submit', {
                disabled: invalid,
                onSubmit: handleSubmit,
              })}
            </form>
          )}
        </Form>
      );
    }

    // 5. ВЫБОР НЕЙМСПЕЙСА
    return (
      <>
        <Dialog.Header caption="Выберите рабочее пространство" />
        <Dialog.Body>
          <Flex
            direction="column"
            gapRow={3}
            style={{
              height: 'calc(100vh - 180px)',
            }}
          >
            <Flex direction="row" className="no-shrink">
              <TextInput
                value={search}
                onUpdate={setSearch}
                placeholder="Поиск по названию"
                size="l"
                hasClear
              />
            </Flex>
            <NamespaceSelector
              data={filteredNS}
              search={search}
              onRowClick={handleSetNamespace}
            />
          </Flex>
        </Dialog.Body>
      </>
    );
  };

  const handleTransitionOutComplete = () => {
    ProjectCreateModel.reset();
    reset();
  };

  return (
    <Dialog
      onTransitionOutComplete={handleTransitionOutComplete}
      open={open}
      onClose={onClose}
      size="s"
      disableOutsideClick
      className="sf-dialog"
    >
      {renderContent()}
    </Dialog>
  );
};
