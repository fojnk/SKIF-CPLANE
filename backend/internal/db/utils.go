package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/metrics"
)

type Config struct {
	Host     string `yaml:"host"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	Database string `yaml:"database"`
}

type dbProxy struct {
	pool *pgxpool.Pool
}

func addDBMetrics(sql string, f func() error) {
	start := time.Now()
	err := f()
	var status = "ok"
	if err != nil {
		status = "fail"
	}
	metrics.DBTime.WithLabelValues(sql, status).Observe(float64(time.Since(start).Nanoseconds()) / 1000000)
}

func (p *dbProxy) Exec(ctx context.Context, sql string, args ...interface{}) (pgconn.CommandTag, error) {
	var (
		tag pgconn.CommandTag
		err error
	)
	addDBMetrics(sql, func() error {
		tag, err = p.pool.Exec(ctx, sql, args...)
		return err
	})
	return tag, err
}

func (p *dbProxy) Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
	var (
		rows pgx.Rows
		err  error
	)
	addDBMetrics(sql, func() error {
		rows, err = p.pool.Query(ctx, sql, args...)
		return err
	})
	return rows, err
}

func (p *dbProxy) QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row {
	var row pgx.Row
	addDBMetrics(sql, func() error {
		row = p.pool.QueryRow(ctx, sql, args...)
		return nil
	})
	return row
}

func (p *dbProxy) SendBatch(ctx context.Context, batch *pgx.Batch) pgx.BatchResults {
	// TODO: add metrics
	return p.pool.SendBatch(ctx, batch)
}

func New(ctx context.Context, config *Config) (*Wrapper, error) {
	connectionString := fmt.Sprintf("postgresql://%s/%s?user=%s&password=%s&target_session_attrs=read-write", config.Host, config.Database, config.User, config.Password)
	conf, err := pgxpool.ParseConfig(connectionString)
	if err != nil {
		return nil, err
	}

	pool, err := pgxpool.NewWithConfig(ctx, conf)
	if err != nil {
		return nil, err
	}

	_, err = pool.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	return &Wrapper{Queries: dbcore.New(&dbProxy{pool}), Pool: pool}, nil
}
