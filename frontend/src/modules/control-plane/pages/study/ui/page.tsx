import { Dialog } from '@gravity-ui/uikit';
import { useCallback, useEffect, useState } from 'react';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  AdminContentEditor,
  InfoPostCard,
  MarkdownContent,
  MarkdownEditor,
} from '@/modules/control-plane/shared/ui';
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
      <InfoPostCard>
        <MarkdownContent content={content} />
      </InfoPostCard>

      {isAdmin && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size="l"
          className="sf-dialog"
        >
          <Dialog.Header caption="Редактирование: Обучение" />
          <Dialog.Body>
            <MarkdownEditor value={draftContent} onChange={setDraftContent} disabled={saving} rows={14} />
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
