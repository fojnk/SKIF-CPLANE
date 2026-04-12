-- Синхронизация глобального чтения: все неудалённые пользователи в группе + недостающие строки t_user_rule.
-- Устраняет 403, если пользователь в группе, но триггеры не создали записи прав (или группа добавлена до t_acl_match).

INSERT INTO t_user_group_match (user_id, user_group_id)
SELECT u.id, g.id
FROM t_user u
CROSS JOIN t_user_group g
WHERE g.name = 'all_authenticated_users'
  AND u.deleted = FALSE
ON CONFLICT (user_id, user_group_id) DO NOTHING;

-- Правила через роль (global_reader и любые другие роли, привязанные к группе через t_acl_match).
INSERT INTO t_user_rule (user_id, rule_id, acl_match_id)
SELECT DISTINCT ugm.user_id, rm.rule_id, am.id
FROM t_user_group_match ugm
JOIN t_user u ON u.id = ugm.user_id AND u.deleted = FALSE
JOIN t_acl_match am
  ON am.user_group_id = ugm.user_group_id
 AND am.role_id IS NOT NULL
JOIN t_role_match rm ON rm.role_id = am.role_id
WHERE NOT EXISTS (
    SELECT 1
    FROM t_user_rule ur
    WHERE ur.user_id = ugm.user_id
      AND ur.rule_id = rm.rule_id
      AND ur.acl_match_id = am.id
);

-- Прямые привязки правил к группе (t_acl_match.rule_id IS NOT NULL).
INSERT INTO t_user_rule (user_id, rule_id, acl_match_id)
SELECT DISTINCT ugm.user_id, am.rule_id, am.id
FROM t_user_group_match ugm
JOIN t_user u ON u.id = ugm.user_id AND u.deleted = FALSE
JOIN t_acl_match am
  ON am.user_group_id = ugm.user_group_id
 AND am.rule_id IS NOT NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM t_user_rule ur
    WHERE ur.user_id = ugm.user_id
      AND ur.rule_id = am.rule_id
      AND ur.acl_match_id = am.id
);
