package db

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/metrics"
)

type Wrapper struct {
	*dbcore.Queries
	Pool *pgxpool.Pool
}

type txKey struct{}

func WithTx(ctx context.Context, tx pgx.Tx) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}

func GetTx(ctx context.Context) (pgx.Tx, bool) {
	tx, ok := ctx.Value(txKey{}).(pgx.Tx)
	return tx, ok
}

func (w *Wrapper) InsertExperimentTemplateVTxCore(ctx context.Context, arg dbcore.InsertExperimentTemplateVParams) (int32, error) {
	tx, err := w.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return 0, err
	}

	defer func() {
		_ = tx.Rollback(ctx)
	}()

	id, err := w.WithTx(tx).InsertExperimentTemplateV(ctx, arg)
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, err
	}

	return id, nil
}

func (w *Wrapper) InsertExperimentTemplateVTx(ctx context.Context, arg dbcore.InsertExperimentTemplateVParams) (int32, error) {
	res, err := w.InsertExperimentTemplateVTxCore(ctx, arg)
	start := time.Now()
	var status = "ok"
	if err != nil {
		status = "fail"
	}
	metrics.DBTime.WithLabelValues("InsertExperimentTemplateVTx", status).Observe(float64(time.Since(start).Nanoseconds()) / 1000000)
	return res, err
}

func (w *Wrapper) SyncUserRoles(ctx context.Context, arg dbcore.DeleteUserRolesParams) error {
	tx, err := w.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}

	defer func() {
		_ = tx.Rollback(ctx)
	}()

	err = w.WithTx(tx).DeleteUserRoles(ctx, arg)
	if err != nil {
		return err
	}

	err = w.WithTx(tx).DeleteUserRulesForDeletedRoles(ctx, dbcore.DeleteUserRulesForDeletedRolesParams{
		UserID: arg.UserID.Int32,
		Roles:  arg.Roles,
	})
	if err != nil {
		return err
	}

	err = w.WithTx(tx).CreateUserRoles(ctx, dbcore.CreateUserRolesParams{
		UserID: arg.UserID,
		Roles:  arg.Roles,
	})
	if err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}
