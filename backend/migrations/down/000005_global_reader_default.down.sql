DELETE FROM t_acl_match
WHERE user_group_id IN (SELECT id FROM t_user_group WHERE name = 'all_authenticated_users');

DELETE FROM t_user_group_match
WHERE user_group_id IN (SELECT id FROM t_user_group WHERE name = 'all_authenticated_users');

DELETE FROM t_role_match
WHERE role_id IN (SELECT id FROM t_role WHERE name = 'global_reader');

DELETE FROM t_rule
WHERE (object_type, object_attribute, object_id, action) IN (
    ('namespace', '.*', 0, '00R'),
    ('project', '.*', 0, '00R'),
    ('experiment', '.*', 0, '00R'),
    ('dataset', '.*', 0, '00R'),
    ('cube', '.*', 0, '00R')
);

DELETE FROM t_role WHERE name = 'global_reader';

DELETE FROM t_user_group WHERE name = 'all_authenticated_users';
