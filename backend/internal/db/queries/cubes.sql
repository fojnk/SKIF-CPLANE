-- name: InsertCube :one
INSERT INTO t_cubes(name, author, description, base_id, params_name, params, type) 
    VALUES($1, $2, $3, $4, $5, $6, $7) 
RETURNING id, name, author, description, base_id, params_name, params, type;

-- name: UpdateCube :one
UPDATE t_cubes SET
    name = $2,
    description = $3, 
    params_name = $4,
    params = $5,
    type = $6,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, author, description, base_id, params_name, params, type;

-- name: SelectCubes :many
SELECT 
    id,
    name,
    author,
    description,
    base_id, 
    params_name, 
    params,
    type
FROM t_cubes
ORDER BY name ASC;

-- name: SelectCubesByIDs :many
SELECT 
    id,
    name,
    author,
    description,
    base_id, 
    params_name, 
    params,
    type
FROM t_cubes
WHERE id = ANY(@ids::int[])
ORDER BY name ASC;

-- name: SelectCubeByID :one
SELECT 
    id,
    name,
    author,
    description,
    base_id, 
    params_name, 
    params,
    type 
FROM t_cubes
WHERE id = $1;

-- name: SelectCubeByName :one
SELECT
    id,
    name,
    author,
    description,
    base_id,
    params_name,
    params,
    type
FROM t_cubes
WHERE name = $1;

-- name: SelectCubesByParamsNames :many
SELECT
    id,
    name,
    params_name
FROM t_cubes
WHERE params_name = ANY(@params_names::varchar[]);
