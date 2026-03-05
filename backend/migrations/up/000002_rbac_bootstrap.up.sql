-- Bootstrap global root role and development users.
-- Migration is idempotent and safe to re-run.

INSERT INTO t_user(name)
VALUES ('root')
ON CONFLICT (name) DO NOTHING;

INSERT INTO t_user(name)
VALUES ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO t_role(name, description, idm_id)
VALUES ('root_admin', 'Global root role for development', 'local_root_admin')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO t_rule(object_type, object_attribute, object_id, action)
VALUES
    ('root', '', 0, '03D'),
    ('namespace', '', 0, '03D'),
    ('project', '', 0, '03D'),
    ('dataset', '', 0, '03D'),
    ('experiment', '', 0, '03D'),
    ('cube', '', 0, '03D')
ON CONFLICT (object_type, object_attribute, object_id, action) DO NOTHING;

INSERT INTO t_role_match(rule_id, role_id)
SELECT r.id, role.id
FROM t_rule r
CROSS JOIN (
    SELECT id
    FROM t_role
    WHERE name = 'root_admin'
    LIMIT 1
) role
WHERE (r.object_type, r.object_attribute, r.object_id, r.action) IN (
    ('root', '', 0, '03D'),
    ('namespace', '', 0, '03D'),
    ('project', '', 0, '03D'),
    ('dataset', '', 0, '03D'),
    ('experiment', '', 0, '03D'),
    ('cube', '', 0, '03D')
)
ON CONFLICT (rule_id, role_id) DO NOTHING;

INSERT INTO t_acl_match(user_id, role_id)
SELECT u.id, role.id
FROM t_user u
CROSS JOIN (
    SELECT id
    FROM t_role
    WHERE name = 'root_admin'
    LIMIT 1
) role
WHERE u.name IN ('root', 'admin')
ON CONFLICT (user_id, role_id) DO NOTHING;
