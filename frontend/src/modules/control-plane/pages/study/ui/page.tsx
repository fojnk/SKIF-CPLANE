import { Dialog, Flex, Text, TextArea } from '@gravity-ui/uikit';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { AdminContentEditor } from '@/modules/control-plane/shared/ui';
import { fetchAppIsAdmin } from '@/modules/control-plane/shared/utils/app-admin';
import { notifications } from '@/shared/ui/notifications';

export const SFStudyPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const normalizedDraftContent = draftContent.trim();
  const hasChanges = normalizedDraftContent !== content.trim();

  const contentParagraphs = useMemo(
    () =>
      content
        .split('\n\n')
        .map((item) => item.trim())
        .filter(Boolean),
    [content],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [upcomingData, admin] = await Promise.all([
        controlPlaneApi.app.v1AppUpcomingList(),
        fetchAppIsAdmin(),
      ]);

      setIsAdmin(admin);
      setContent(upcomingData.data.app_upcoming?.content ?? '');
    } catch {
      notifications.push({
        name: 'study-load-error',
        title: 'Не удалось загрузить раздел Обучение',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!hasChanges) {
      setModalOpen(false);
      return;
    }

    setSaving(true);
    try {
      await controlPlaneApi.app.v1AppUpcomingUpdate({ content: normalizedDraftContent });
      notifications.push({
        name: 'study-save-success',
        title: 'Раздел Обучение обновлен',
        type: 'success',
      });
      setModalOpen(false);
      await load();
    } catch {
      notifications.push({
        name: 'study-save-error',
        title: 'Не удалось сохранить раздел Обучение',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setDraftContent(content);
    setModalOpen(true);
  };

  return (
    <AdminContentEditor
      title="Обучение"
      loading={loading}
      isAdmin={isAdmin}
      onReload={() => void load()}
      onEdit={openEditModal}
    >
      <Flex
        direction="column"
        gap={3}
        style={{
          border: '1px solid var(--g-color-line-generic)',
          borderRadius: 16,
          padding: 20,
          background: 'var(--g-color-base-float)',
          boxShadow: '0 2px 10px 0 var(--g-color-sfx-shadow)',
        }}
      >
        {contentParagraphs.length > 0 ? (
          <Flex direction="column" gap={2}>
            {contentParagraphs.map((paragraph, index) => (
              <Text
                key={`${paragraph}-${index}`}
                variant={index === 0 ? 'subheader-2' : 'body-1'}
                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}
              >
                {paragraph}
              </Text>
            ))}
          </Flex>
        ) : (
          <Text variant="body-2" color="secondary">
            Контент пока не заполнен.
          </Text>
        )}
      </Flex>

      {isAdmin && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size="l"
          className="sf-dialog"
        >
          <Dialog.Header caption="Редактирование: Обучение" />
          <Dialog.Body>
            <Flex direction="column" gap={2}>
              <Text variant="body-2" color="secondary">
                Используйте пустую строку между абзацами для более читаемого вида.
              </Text>
              <TextArea
                value={draftContent}
                rows={14}
                onUpdate={setDraftContent}
                disabled={saving}
              />
            </Flex>
          </Dialog.Body>
          <Dialog.Footer
            textButtonCancel="Отмена"
            textButtonApply="Сохранить"
            onClickButtonCancel={() => setModalOpen(false)}
            onClickButtonApply={() => void onSave()}
            propsButtonApply={{ loading: saving, disabled: !hasChanges }}
          />
        </Dialog>
      )}
    </AdminContentEditor>
  );
};
