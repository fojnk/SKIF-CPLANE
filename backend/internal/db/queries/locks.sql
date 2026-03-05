-- name: LockABCSyncer :one
SELECT pg_try_advisory_lock(1);

-- name: UnlockABCSyncer :one
SELECT pg_advisory_unlock(1);
