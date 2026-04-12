-- Группа всех аутентифицированных пользователей + роль глобального чтения (namespace, project, experiment, dataset, cube).
-- Не выдаёт права на root / ACL / user / role — только просмотр данных.

INSERT INTO t_user_group (name)
SELECT 'all_authenticated_users'
WHERE NOT EXISTS (
    SELECT 1 FROM t_user_group WHERE name = 'all_authenticated_users'
);

INSERT INTO t_role (name, description, idm_id)
SELECT 'global_reader', 'Глобальное чтение сущностей для всех пользователей', 'global_reader'
WHERE NOT EXISTS (SELECT 1 FROM t_role WHERE name = 'global_reader');

INSERT INTO t_rule (object_type, object_attribute, object_id, action)
VALUES
    ('namespace', '.*', 0, '00R'),
    ('project', '.*', 0, '00R'),
    ('experiment', '.*', 0, '00R'),
    ('dataset', '.*', 0, '00R'),
    ('cube', '.*', 0, '00R')
ON CONFLICT (object_type, object_attribute, object_id, action) DO NOTHING;

INSERT INTO t_role_match (rule_id, role_id)
SELECT r.id, role.id
FROM t_rule r
CROSS JOIN (SELECT id FROM t_role WHERE name = 'global_reader' LIMIT 1) role
WHERE (r.object_type, r.object_attribute, r.object_id, r.action) IN (
    ('namespace', '.*', 0, '00R'),
    ('project', '.*', 0, '00R'),
    ('experiment', '.*', 0, '00R'),
    ('dataset', '.*', 0, '00R'),
    ('cube', '.*', 0, '00R')
)
ON CONFLICT (rule_id, role_id) DO NOTHING;

INSERT INTO t_acl_match (user_group_id, role_id)
SELECT g.id, role.id
FROM t_user_group g
CROSS JOIN (SELECT id FROM t_role WHERE name = 'global_reader' LIMIT 1) role
WHERE g.name = 'all_authenticated_users'
ON CONFLICT (user_group_id, role_id) DO NOTHING;

INSERT INTO t_user_group_match (user_id, user_group_id)
SELECT u.id, g.id
FROM t_user u
CROSS JOIN t_user_group g
WHERE g.name = 'all_authenticated_users'
ON CONFLICT (user_id, user_group_id) DO NOTHING;
