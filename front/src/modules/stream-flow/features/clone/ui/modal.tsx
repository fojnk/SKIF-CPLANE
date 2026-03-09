import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  ClonePayload,
  CloneForm,
  CloneModel,
  SelectedProject,
} from '@/modules/stream-flow/features/clone';
import { SfDialogFooter } from '@/modules/stream-flow/shared/ui/sf-dialog-footer';
import { useValue } from '@/shared/lib/react/hooks/use-value';
import { ModalViewProps } from '@/shared/ui/modals';

import { ModalCloneForm, ModalProjectSelector } from './components';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<ClonePayload>) => {
  const selectedProject = useValue<SelectedProject | null>(
    payload.can_create && payload.src_project ? payload.src_project : null,
  );

  const [pendingDs, pendingPipe, cloneExperiment, cloneDs] = useUnit([
    CloneModel.$pendingDs,
    CloneModel.$pendingPipe,
    CloneModel.cloneExperiment,
    CloneModel.cloneDS,
  ]);

  const srcType = payload.src_type === 'pipe' ? 'Эксперимент' : 'Датасет';

  const handleSubmit = (form: CloneForm) => {
    if (selectedProject.value) {
      const data = {
        name: form.name,
        project_id: selectedProject.value.id!,
        comment: form.comment ?? undefined,
      };

      if (payload.src_type === 'pipe') {
        cloneExperiment({
          ...data,
          src_experiment_id: payload.src_id,
        });
      } else {
        cloneDs({
          ...data,
          src_dataset_id: payload.src_id,
        });
      }
    }
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size={selectedProject.value ? 'm' : 'l'}
      disableOutsideClick
      className="sf-dialog"
    >
      <Form onSubmit={handleSubmit}>
        {({ handleSubmit, valid }) => {
          return (
            <form onSubmit={handleSubmit} name="clone-ds-form">
              <Dialog.Header
                caption={
                  selectedProject.value
                    ? `Клонировать ${srcType.toLowerCase()}`
                    : 'Выберите целевой проект'
                }
              />
              <Dialog.Body>
                {selectedProject.value ? (
                  <ModalCloneForm
                    srcName={payload.src_name}
                    srcType={`${srcType}`}
                    selectedProject={selectedProject.value}
                    onResetSelected={() => {
                      selectedProject.set(null);
                    }}
                  />
                ) : (
                  <Flex
                    direction="column"
                    gapRow={3}
                    style={{
                      height: 'calc(100vh - 180px)',
                    }}
                  >
                    <ModalProjectSelector onRowClick={selectedProject.set} />
                  </Flex>
                )}
              </Dialog.Body>
              <SfDialogFooter
                disabled={!valid || selectedProject.value === null}
                onClose={onClose}
                onSubmit={handleSubmit}
                pending={pendingDs || pendingPipe}
                textApply="Клонировать"
              />
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
