-- name: SelectExperimentForAlerts :one
select
	pipe.project_id as project_id,
    project.name as project_name,
	project.deleted as project_is_deleted,
	project.project_version_id,
	pipe.id as experiment_id,
	pipe_temp.name as experiment_name,
	pipe_temp.deleted as pipe_is_deleted
FROM t_experiment pipe
join t_project project
on project.id = pipe.project_id 
join t_experiment_template_v tptv
on pipe.template_v_id = tptv.id
join t_experiment_template pipe_temp
on pipe_temp.id = tptv.parent_id
where pipe.id = $1;

-- name: SelectAlerts :many
select
	groups.*,
	rules.rule_id,
	rules.template_alert_id,
	rules.severity_name,
	rules.severity_is_active,
	rules.alert_limit,
	rules.delay_firing,
	rules.delay_resolving
FROM t_alert_groups groups
join t_alert_rules rules
on rules.alert_group_id = groups.alert_group_id
where groups.product_id = $1 and groups.experiment_id = $2;

-- name: SelectAlertGroup :one
SELECT * FROM t_alert_groups WHERE product_id = $1 AND experiment_id = $2;

-- name: SelectAlertGroups :many
SELECT * FROM t_alert_groups WHERE experiment_id = $1;

-- name: SelectGroupsByProductIds :many
SELECT * FROM t_alert_groups WHERE product_id = $1;

-- name: SelectProduct :one
select * from t_products where product_id = $1;

-- name: SelectGroupById :one
SELECT * FROM t_alert_groups WHERE alert_group_id = $1;

-- name: InsertProduct :exec
insert into t_products (product_id) values ($1);

-- name: InsertAlertGroup :exec
INSERT INTO t_alert_groups (
	product_id,
	experiment_id
) VALUES (
	$1, $2
);

-- name: InsertAlertRule :batchexec
INSERT INTO t_alert_rules (
	alert_group_id,
	template_alert_id,
	severity_name,
	severity_is_active,
	alert_limit,
	delay_firing,
	delay_resolving
) VALUES (
	$1, $2, $3, $4, $5, $6, $7
);

-- name: UpdateAlertRule :batchexec
UPDATE t_alert_rules
SET
	template_alert_id = $1,
	severity_name = $2,
	severity_is_active = $3,
	alert_limit = $4,
	delay_firing = $5,
	delay_resolving = $6
WHERE rule_id = $7;

-- name: DeleteAlertRule :batchexec
DELETE FROM t_alert_rules
WHERE rule_id = $1;

-- name: DeleteAlertGroups :batchexec
DELETE FROM t_alert_groups
WHERE alert_group_id = $1;

-- name: DeleteNotificationProductIds :batchexec
DELETE FROM t_products
WHERE product_id = $1;

-- name: SelectAlertsByTemplate :many
select
	groups.*,
	rules.rule_id,
	rules.template_alert_id,
	rules.severity_name,
	rules.severity_is_active,
	rules.alert_limit,
	rules.delay_firing,
	rules.delay_resolving
FROM t_alert_groups groups
join t_alert_rules rules
on rules.alert_group_id = groups.alert_group_id
where groups.product_id = $1 and groups.experiment_id = $2 and rules.template_alert_id = $3;

-- name: SelectProducts :many
SELECT DISTINCT product_id FROM t_alert_groups WHERE experiment_id = $1;
