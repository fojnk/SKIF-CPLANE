-- Rollback for root bootstrap migration.

DELETE FROM t_acl_match
WHERE role_id IN (SELECT id FROM t_role WHERE name = 'root_admin');

DELETE FROM t_role_match
WHERE role_id IN (SELECT id FROM t_role WHERE name = 'root_admin')
  AND rule_id IN (
      SELECT id
      FROM t_rule
      WHERE (object_type, object_attribute, object_id, action) IN (
          ('root', '', 0, '03D'),
          ('namespace', '', 0, '03D'),
          ('project', '', 0, '03D'),
          ('dataset', '', 0, '03D'),
          ('experiment', '', 0, '03D'),
          ('cube', '', 0, '03D')
      )
  );

DELETE FROM t_role
WHERE name = 'root_admin';

DELETE FROM t_rule
WHERE (object_type, object_attribute, object_id, action) IN (
    ('root', '', 0, '03D'),
    ('namespace', '', 0, '03D'),
    ('project', '', 0, '03D'),
    ('dataset', '', 0, '03D'),
    ('experiment', '', 0, '03D'),
    ('cube', '', 0, '03D')
)
  AND NOT EXISTS (SELECT 1 FROM t_role_match WHERE t_role_match.rule_id = t_rule.id)
  AND NOT EXISTS (SELECT 1 FROM t_acl_match WHERE t_acl_match.rule_id = t_rule.id);

DELETE FROM t_user
WHERE name = 'root'
  AND NOT EXISTS (SELECT 1 FROM t_acl_match WHERE t_acl_match.user_id = t_user.id);

DELETE FROM t_user
WHERE name = 'admin'
  AND NOT EXISTS (SELECT 1 FROM t_acl_match WHERE t_acl_match.user_id = t_user.id);
