import { Dialog, Flex, Link, Text, TextArea } from '@gravity-ui/uikit';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { AdminContentEditor, MarkdownContent, MarkdownEditor } from '@/modules/control-plane/shared/ui';
import { fetchAppIsAdmin } from '@/modules/control-plane/shared/utils/app-admin';
import { notifications } from '@/shared/ui/notifications';

export const SFAboutPlatformPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState('');
  const [links, setLinks] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftLinks, setDraftLinks] = useState('');

  const normalizedDraftContent = draftContent.trim();
  const normalizedDraftLinks = draftLinks
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n');
  const hasChanges =
    normalizedDraftContent !== content.trim() || normalizedDraftLinks !== links.trim();

  const linksList = useMemo(
    () =>
      links
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [left, right] = line.includes('|')
            ? line.split('|', 2).map((part) => part.trim())
            : [line, line];
          return {
            label: left || right,
            href: right || left,
          };
        })
        .filter((item) => /^https?:\/\//i.test(item.href)),
    [links],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aboutData, admin] = await Promise.all([
        controlPlaneApi.app.v1AppAboutList(),
        fetchAppIsAdmin(),
      ]);

      setIsAdmin(admin);
      setContent(aboutData.data.app_about?.content ?? '');
      setLinks(aboutData.data.app_about?.links ?? '');
    } catch {
      notifications.push({
        name: 'about-platform-load-error',
        title: 'Не удалось загрузить раздел О платформе',
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
      await controlPlaneApi.app.v1AppAboutUpdate({
        content: normalizedDraftContent,
        links: normalizedDraftLinks,
      });
      notifications.push({
        name: 'about-platform-save-success',
        title: 'Раздел О платформе обновлен',
        type: 'success',
      });
      setModalOpen(false);
      await load();
    } catch {
      notifications.push({
        name: 'about-platform-save-error',
        title: 'Не удалось сохранить раздел О платформе',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setDraftContent(content);
    setDraftLinks(links);
    setModalOpen(true);
  };

  return (
    <AdminContentEditor
      title="О платформе"
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
        <MarkdownContent content={content} />
        {linksList.length > 0 && (
          <Flex direction="column" gap={1}>
            <Text variant="subheader-2">Полезные ссылки</Text>
            {linksList.map((item) => (
              <Link key={`${item.label}-${item.href}`} href={item.href} target="_blank" view="primary">
                {item.label}
              </Link>
            ))}
          </Flex>
        )}
      </Flex>

      {isAdmin && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size="l"
          className="sf-dialog"
        >
          <Dialog.Header caption="Редактирование: О платформе" />
          <Dialog.Body>
            <Flex direction="column" gap={2}>
              <Text variant="subheader-2">Контент</Text>
              <MarkdownEditor
                value={draftContent}
                onChange={setDraftContent}
                disabled={saving}
                rows={12}
              />
              <Text variant="subheader-2">Ссылки (по одной на строку)</Text>
              <Text variant="body-2" color="secondary">
                Формат: `https://...` или `Название | https://...`.
              </Text>
              <TextArea
                value={draftLinks}
                rows={6}
                onUpdate={setDraftLinks}
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
