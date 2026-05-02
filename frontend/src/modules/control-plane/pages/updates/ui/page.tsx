import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Label,
  Loader,
  Link,
  Text,
  TextArea,
  TextInput,
} from '@gravity-ui/uikit';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ListPage, PageTitle } from '@/modules/control-plane/shared/layouts';
import { InfoPostCard, MarkdownContent } from '@/modules/control-plane/shared/ui';
import { fetchAppIsAdmin } from '@/modules/control-plane/shared/utils/app-admin';
import { Link as RouteLink } from '@/shared/lib/routing';
import { notifications } from '@/shared/ui/notifications';

type AppUpdate = controlPlaneApi.dc.DtoAppUpdateDC;

const toOptionalValue = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const toDatetimeLocalValue = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toRfc3339FromLocal = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed === '') return '';

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
};

const formatReleaseDate = (value?: string): string => {
  if (!value) return 'Дата не указана';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Некорректная дата';
  return parsed.toLocaleString();
};

/** Короткий анонс из markdown для карточек рядом с лентой */
const teaserFromMarkdown = (raw: string | undefined, maxLen: number): string => {
  if (!raw?.trim()) return '';
  const flat = raw
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[[^\]]+\]\([^)]+\)/g, '')
    .replace(/[*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (flat.length <= maxLen) return flat;
  return `${flat.slice(0, maxLen - 1)}…`;
};

export const SFUpdatesPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditId, setModalEditId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<AppUpdate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [aboutTeaser, setAboutTeaser] = useState('');
  const [studyTeaser, setStudyTeaser] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const normalizedReleaseDate = toRfc3339FromLocal(releaseDate);
  const hasInvalidReleaseDate =
    releaseDate.trim() !== '' && normalizedReleaseDate === '';

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (!query) return true;
      const haystack = [item.title, item.description, item.content]
        .map((part) => (part ?? '').toLowerCase())
        .join(' ');
      return haystack.includes(query);
    });

    const sorted = [...filtered].sort((a, b) => {
      const left = (a.title ?? '').toLowerCase();
      const right = (b.title ?? '').toLowerCase();
      if (left === right) return 0;
      const base = left > right ? 1 : -1;
      return sortAsc ? base : -base;
    });

    return sorted;
  }, [items, searchQuery, sortAsc]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const publishedCount = useMemo(
    () => items.filter((item) => Boolean(item.is_published)).length,
    [items],
  );

  const fillForm = useCallback((item: AppUpdate | null) => {
    setTitle(item?.title ?? '');
    setDescription(item?.description ?? '');
    setContent(item?.content ?? '');
    setReleaseDate(toDatetimeLocalValue(item?.release_date));
    setImageUrl(item?.image_url ?? '');
    setVideoUrl(item?.video_url ?? '');
    setIsPublished(Boolean(item?.is_published));
  }, []);

  const load = useCallback(
    async (keepSelectedId?: number | null) => {
      setLoading(true);
      try {
        const [updatesResponse, admin, aboutRes, upcomingRes] = await Promise.all([
          controlPlaneApi.app.v1AppUpdatesList({ offset: 0, limit: 100 }),
          fetchAppIsAdmin(),
          controlPlaneApi.app.v1AppAboutList().catch(() => undefined),
          controlPlaneApi.app.v1AppUpcomingList().catch(() => undefined),
        ]);

        setAboutTeaser(teaserFromMarkdown(aboutRes?.data.app_about?.content, 240));
        setStudyTeaser(teaserFromMarkdown(upcomingRes?.data.app_upcoming?.content, 240));

        setIsAdmin(admin);
        const loadedItems = updatesResponse.data.app_updates ?? [];
        const visibleItems = admin
          ? loadedItems
          : loadedItems.filter((item) => Boolean(item.is_published));
        setItems(visibleItems);

        const nextSelectedId =
          keepSelectedId !== undefined
            ? keepSelectedId
            : selectedId ?? visibleItems[0]?.id ?? null;

        const nextSelected =
          visibleItems.find((item) => item.id === nextSelectedId) ?? null;

        setSelectedId(nextSelected?.id ?? null);
      } catch {
        notifications.push({
          name: 'updates-load-error',
          title: 'Не удалось загрузить раздел Обновления',
          type: 'danger',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const onSelect = (item: AppUpdate) => {
    setSelectedId(item.id ?? null);
  };

  const onOpenCreateModal = () => {
    setModalEditId(null);
    fillForm(null);
    setIsPublished(false);
    setModalOpen(true);
  };

  const onOpenEditModal = () => {
    if (!selectedItem) {
      notifications.push({
        name: 'updates-edit-select-item',
        title: 'Выберите обновление для редактирования',
        type: 'warning',
      });
      return;
    }
    setModalEditId(selectedItem.id ?? null);
    fillForm(selectedItem);
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!isAdmin) return;
    if (hasInvalidReleaseDate) {
      notifications.push({
        name: 'updates-save-invalid-date',
        title: 'Некорректная дата релиза. Используйте RFC3339',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      if (modalEditId) {
        await controlPlaneApi.app.v1AppUpdateUpdate({
          id: modalEditId,
          title: toOptionalValue(title),
          description: toOptionalValue(description),
          content: toOptionalValue(content),
          release_date: toOptionalValue(normalizedReleaseDate),
          image_url: toOptionalValue(imageUrl) ?? null,
          video_url: toOptionalValue(videoUrl) ?? null,
          is_published: isPublished,
        });
      } else {
        await controlPlaneApi.app.v1AppUpdateCreate({
          title: toOptionalValue(title),
          description: toOptionalValue(description),
          content: toOptionalValue(content),
          release_date: toOptionalValue(normalizedReleaseDate),
          image_url: toOptionalValue(imageUrl) ?? null,
          video_url: toOptionalValue(videoUrl) ?? null,
          is_published: isPublished,
        });
      }

      notifications.push({
        name: 'updates-save-success',
        title: modalEditId ? 'Обновление сохранено' : 'Обновление создано',
        type: 'success',
      });

      setModalOpen(false);
      setModalEditId(null);
      await load(modalEditId ?? null);
    } catch {
      notifications.push({
        name: 'updates-save-error',
        title: 'Не удалось сохранить обновление',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!isAdmin || !selectedItem?.id) return;
    const selectedTitle =
      selectedItem.title || `#${selectedItem.id}`;
    const confirmed = window.confirm(
      `Удалить обновление "${selectedTitle}"? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await controlPlaneApi.app.v1AppUpdateDelete({ id: selectedItem.id });
      notifications.push({
        name: 'updates-delete-success',
        title: 'Обновление удалено',
        type: 'success',
      });
      await load(null);
    } catch {
      notifications.push({
        name: 'updates-delete-error',
        title: 'Не удалось удалить обновление',
        type: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ListPage>
      <Flex direction="column" gap={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex direction="column" gap={1}>
            <PageTitle>Обновления</PageTitle>
            {isAdmin && (
              <Text variant="body-2" color="warning">
                Режим редактирования (admin/root)
              </Text>
            )}
          </Flex>
          <Flex gap={2}>
            <Button view="outlined" onClick={() => void load()} disabled={loading}>
              Обновить
            </Button>
            {isAdmin && (
              <>
                <Button
                  view="outlined-action"
                  onClick={onOpenCreateModal}
                  disabled={saving}
                >
                  Новое
                </Button>
                <Button
                  view="outlined-info"
                  onClick={onOpenEditModal}
                  disabled={!selectedItem || saving || deleting}
                >
                  Редактировать
                </Button>
                <Button
                  view="outlined-danger"
                  loading={deleting}
                  disabled={!selectedItem}
                  onClick={onDelete}
                >
                  Удалить
                </Button>
              </>
            )}
          </Flex>
        </Flex>

        {loading ? (
          <Flex justifyContent="center">
            <Loader size="l" />
          </Flex>
        ) : (
          <>
            <Flex gap={3} style={{ flexWrap: 'wrap' }}>
              <InfoPostCard style={{ flex: '1 1 260px', minWidth: 240 }}>
                <Text variant="subheader-2">О платформе</Text>
                <Text variant="body-2" color="secondary">
                  {aboutTeaser ||
                    'Краткое описание назначения системы и ссылки на документацию — в отдельном разделе.'}
                </Text>
                <RouteLink to={ControlPlaneModule.routes.aboutPlatform} params={{}}>
                  Перейти к разделу
                </RouteLink>
              </InfoPostCard>
              <InfoPostCard style={{ flex: '1 1 260px', minWidth: 240 }}>
                <Text variant="subheader-2">Обучение</Text>
                <Text variant="body-2" color="secondary">
                  {studyTeaser ||
                    'Сценарии работы с проектами, датасетами и пайплайнами — в материалах для новых пользователей.'}
                </Text>
                <RouteLink to={ControlPlaneModule.routes.study} params={{}}>
                  Перейти к разделу
                </RouteLink>
              </InfoPostCard>
            </Flex>

            <Flex gap={2} alignItems="center">
              <TextInput
                value={searchQuery}
                onUpdate={setSearchQuery}
                placeholder="Поиск по заголовку, описанию или тексту"
              />
              <Button view="flat" onClick={() => setSortAsc((prev) => !prev)}>
                Сортировка: {sortAsc ? 'A-Z' : 'Z-A'}
              </Button>
              {isAdmin && (
                <Text variant="body-2" color="secondary">
                  Публичных: {publishedCount} из {items.length}
                </Text>
              )}
            </Flex>

            {visibleItems.length === 0 ? (
              <Text variant="body-2" color="secondary">
                Ничего не найдено
              </Text>
            ) : isAdmin ? (
              <Flex gap={3} alignItems="stretch">
                <Flex direction="column" gap={2} style={{ maxWidth: 520, width: '100%' }}>
                  {visibleItems.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <Button
                        key={item.id}
                        view={active ? 'action' : 'normal'}
                        width="max"
                        onClick={() => onSelect(item)}
                      >
                        <Flex justifyContent="space-between" alignItems="center" gap={2}>
                          <Text ellipsis>{item.title || `Обновление #${item.id}`}</Text>
                          <Label theme={item.is_published ? 'success' : 'unknown'}>
                            {item.is_published ? 'Опубликовано' : 'Черновик'}
                          </Label>
                        </Flex>
                      </Button>
                    );
                  })}
                </Flex>
                <InfoPostCard style={{ flex: 1, minWidth: 340 }}>
                  <Text variant="header-1">
                    {selectedItem?.title || 'Выберите обновление слева'}
                  </Text>
                  {selectedItem && (
                    <>
                      <Flex gap={2} alignItems="center" wrap="wrap">
                        <Label theme={selectedItem.is_published ? 'success' : 'unknown'}>
                          {selectedItem.is_published ? 'Опубликовано' : 'Черновик'}
                        </Label>
                        <Text variant="body-2" color="secondary">
                          {formatReleaseDate(selectedItem.release_date)}
                        </Text>
                      </Flex>
                      {!!selectedItem.description && (
                        <Text variant="subheader-2" color="secondary">
                          {selectedItem.description}
                        </Text>
                      )}
                      {!!selectedItem.image_url && (
                        <img
                          src={selectedItem.image_url}
                          alt=""
                          style={{
                            width: '100%',
                            maxHeight: 320,
                            objectFit: 'cover',
                            borderRadius: 12,
                            border: '1px solid var(--g-color-line-generic)',
                          }}
                        />
                      )}
                      <MarkdownContent
                        content={selectedItem.content ?? ''}
                        emptyText="Текст обновления не указан."
                      />
                      <Flex gap={3} alignItems="center" wrap="wrap">
                        {!!selectedItem.image_url && (
                          <Link href={selectedItem.image_url} target="_blank" view="primary">
                            Открыть изображение
                          </Link>
                        )}
                        {!!selectedItem.video_url && (
                          <Link href={selectedItem.video_url} target="_blank" view="primary">
                            Видео
                          </Link>
                        )}
                      </Flex>
                    </>
                  )}
                </InfoPostCard>
              </Flex>
            ) : (
              <Flex direction="column" gap={4}>
                {visibleItems.map((item) => (
                  <InfoPostCard key={item.id}>
                    <Flex justifyContent="space-between" alignItems="flex-start" gap={3}>
                      <Text variant="header-1">{item.title || 'Без заголовка'}</Text>
                      {!!item.release_date && (
                        <Text variant="body-2" color="secondary" style={{ flexShrink: 0 }}>
                          {formatReleaseDate(item.release_date)}
                        </Text>
                      )}
                    </Flex>

                    {!!item.description && (
                      <Text variant="subheader-2" color="secondary">
                        {item.description}
                      </Text>
                    )}

                    {!!item.image_url && (
                      <img
                        src={item.image_url}
                        alt=""
                        style={{
                          width: '100%',
                          maxHeight: 360,
                          objectFit: 'cover',
                          borderRadius: 12,
                          border: '1px solid var(--g-color-line-generic)',
                        }}
                      />
                    )}

                    <MarkdownContent
                      content={item.content ?? ''}
                      emptyText="Текст обновления не указан."
                    />

                    {(!!item.image_url || !!item.video_url) && (
                      <Flex gap={3} alignItems="center" wrap="wrap">
                        {!!item.image_url && (
                          <Link href={item.image_url} target="_blank" view="primary">
                            Открыть изображение
                          </Link>
                        )}
                        {!!item.video_url && (
                          <Link href={item.video_url} target="_blank" view="primary">
                            Видео
                          </Link>
                        )}
                      </Flex>
                    )}
                  </InfoPostCard>
                ))}
              </Flex>
            )}
          </>
        )}
      </Flex>

      {isAdmin && (
        <Dialog
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalEditId(null);
          }}
          size="l"
          className="sf-dialog"
        >
          <Dialog.Header
            caption={modalEditId ? `Редактирование #${modalEditId}` : 'Новое обновление'}
          />
          <Dialog.Body>
            <Flex direction="column" gap={2}>
              <TextInput
                value={title}
                onUpdate={setTitle}
                placeholder="Заголовок"
                disabled={saving || deleting}
              />
              <TextArea
                value={description}
                onUpdate={setDescription}
                rows={3}
                placeholder="Короткое описание"
                disabled={saving || deleting}
              />
              <TextArea
                value={content}
                onUpdate={setContent}
                rows={8}
                placeholder="Основной текст (Markdown: заголовки, списки, жирный текст)"
                disabled={saving || deleting}
              />
              <Flex direction="column" gap={1}>
                <Text variant="body-2" color="secondary">
                  Дата и время релиза
                </Text>
                <input
                  value={releaseDate}
                  type="datetime-local"
                  onChange={(event) => setReleaseDate(event.target.value)}
                  disabled={saving || deleting}
                  style={{
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid var(--g-color-line-generic)',
                    paddingInline: 12,
                    background: 'var(--g-color-base-background)',
                    color: 'var(--g-color-text-primary)',
                  }}
                />
              </Flex>
              {hasInvalidReleaseDate && (
                <Text variant="body-2" color="danger">
                  Некорректная дата. Проверьте дату и время релиза.
                </Text>
              )}
              <TextInput
                value={imageUrl}
                onUpdate={setImageUrl}
                placeholder="URL изображения"
                disabled={saving || deleting}
              />
              <TextInput
                value={videoUrl}
                onUpdate={setVideoUrl}
                placeholder="URL видео"
                disabled={saving || deleting}
              />
              <Checkbox
                checked={isPublished}
                onUpdate={setIsPublished}
                disabled={saving || deleting}
              >
                Опубликовано
              </Checkbox>
            </Flex>
          </Dialog.Body>
          <Dialog.Footer
            textButtonCancel="Отмена"
            textButtonApply="Сохранить"
            onClickButtonCancel={() => {
              setModalOpen(false);
              setModalEditId(null);
            }}
            onClickButtonApply={() => void onSave()}
            propsButtonApply={{
              loading: saving,
              disabled: hasInvalidReleaseDate,
            }}
          />
        </Dialog>
      )}
    </ListPage>
  );
};
