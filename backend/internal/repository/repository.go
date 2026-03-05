package repository

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/config"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository/cache"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository/forms"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository/migrations"
)

type Repository struct {
	Clients   *Clients
	Config    *config.Config
	Logger    *logger.Logger
	Cache     *cache.TokenCache
	DB        db.DB
	FormsRepo forms.Repo
	Version   string
}

func New(ctx context.Context, config *config.Config) (*Repository, error) {
	logger, err := logger.NewLogger(&config.Log)
	if err != nil {
		return nil, err
	}

	clients, err := NewClients(config, logger)
	if err != nil {
		return nil, err
	}
	logger.Info("all clients created")

	database, err := db.New(ctx, &config.Database)
	if err != nil {
		return nil, err
	}
	logger.Info("successfully connected to database")

	migrations.RunMigrations(database.Pool, logger)

	tokenCache := cache.NewTokenCache(config.SessionCache)

	formsRepo := forms.NewFormsRepo()

	return &Repository{
		Clients:   clients,
		Config:    config,
		Logger:    logger,
		DB:        database,
		Cache:     tokenCache,
		FormsRepo: formsRepo,
	}, nil
}
