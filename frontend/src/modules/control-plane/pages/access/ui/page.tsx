import { Button, Flex, Loader, Text } from '@gravity-ui/uikit';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  approvePermissionRequest,
  fetchPermissionRequestsList,
  PermissionRequestItem,
  rejectPermissionRequest,
} from '@/modules/control-plane/api/permission-requests-api';
import { ListPage, PageTitle } from '@/modules/control-plane/shared/layouts';
import { notifications } from '@/shared/ui/notifications';

import css from './page.module.scss';

const ADMIN_QUEUE_OBJECT_TYPES = new Set([
  'namespace',
  'project',
  'experiment',
]);

function formatAction(action: string): string {
  switch (action) {
    case '00R':
      return 'Чтение';
    case '01E':
      return 'Изменение';
    case '02C':
      return 'Создание';
    case '03D':
      return 'Удаление';
    default:
      return action;
  }
}

function formatObjectType(t: string): string {
  switch (t) {
    case 'namespace':
      return 'Рабочая область';
    case 'project':
      return 'Проект';
    case 'experiment':
      return 'Эксперимент';
    default:
      return t;
  }
}

export const SFAccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PermissionRequestItem[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items: raw } = await fetchPermissionRequestsList({
        status: 'pending',
      });
      setItems(
        raw.filter((r) => ADMIN_QUEUE_OBJECT_TYPES.has(r.object_type)),
      );
    } catch {
      notifications.push({
        name: 'access-load-error',
        title: 'Не удалось загрузить заявки',
        type: 'danger',
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onApprove = async (id: number) => {
    setBusyId(id);
    try {
      await approvePermissionRequest(id);
      notifications.push({
        name: `access-approve-${id}`,
        title: 'Доступ выдан',
        type: 'success',
      });
      await load();
    } catch {
      notifications.push({
        name: `access-approve-err-${id}`,
        title: 'Не удалось одобрить заявку',
        type: 'danger',
      });
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (id: number) => {
    setBusyId(id);
    try {
      await rejectPermissionRequest(id);
      notifications.push({
        name: `access-reject-${id}`,
        title: 'Заявка отклонена',
        type: 'info',
      });
      await load();
    } catch {
      notifications.push({
        name: `access-reject-err-${id}`,
        title: 'Не удалось отклонить заявку',
        type: 'danger',
      });
    } finally {
      setBusyId(null);
    }
  };

  const rows = useMemo(() => items, [items]);

  return (
    <ListPage>
      <Flex direction="column" gap={4} className={css.wrap}>
        <Flex justifyContent="space-between" alignItems="center">
          <PageTitle>Доступ</PageTitle>
          <Button view="outlined" size="m" onClick={() => void load()}>
            Обновить
          </Button>
        </Flex>
        <Text variant="body-1" color="secondary">
          Заявки на доступ к рабочим областям, проектам и экспериментам.
          Одобрение выдаёт пользователю правило ACL с указанным действием.
        </Text>
        {loading ? (
          <Flex justifyContent="center" className={css.loader}>
            <Loader size="l" />
          </Flex>
        ) : rows.length === 0 ? (
          <Text variant="body-2">Нет ожидающих заявок</Text>
        ) : (
          <div className={css.tableWrap}>
            <table className={css.table}>
              <thead>
                <tr>
                  <th>Кто</th>
                  <th>Объект</th>
                  <th>ID</th>
                  <th>Право</th>
                  <th>Сообщение</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Text variant="body-2">
                        {row.requester_name || `user #${row.requester_user_id}`}
                      </Text>
                      {row.requester_email ? (
                        <Text variant="caption-2" color="secondary">
                          {row.requester_email}
                        </Text>
                      ) : null}
                    </td>
                    <td>
                      <Text variant="body-2">
                        {formatObjectType(row.object_type)}
                      </Text>
                    </td>
                    <td>{row.object_id}</td>
                    <td>
                      {formatAction(row.action)} / {row.object_attribute}
                    </td>
                    <td>
                      <Text variant="body-2" className={css.message}>
                        {row.message || '—'}
                      </Text>
                    </td>
                    <td>
                      <Flex gap={2}>
                        <Button
                          size="s"
                          view="outlined-success"
                          loading={busyId === row.id}
                          onClick={() => void onApprove(row.id)}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="s"
                          view="outlined-danger"
                          loading={busyId === row.id}
                          onClick={() => void onReject(row.id)}
                        >
                          Отклонить
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Flex>
    </ListPage>
  );
};
