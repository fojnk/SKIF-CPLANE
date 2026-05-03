package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	chiprometheus "github.com/766b/chi-prometheus"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/julienschmidt/httprouter"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	httpSwagger "github.com/swaggo/http-swagger"
	"github.com/swaggo/swag"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/bootstrap/cms"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/config"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/docs/private_docs"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/private"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

var version string
var extraSwaggerInstanceName = "extra-swagger"

type App struct {
	svc *service.Service
}

func NewApp(ctx context.Context) (*App, error) {
	config, err := config.NewConfig(envOrDefault("CPLANE_CONFIG_PATH", "./config.yaml"))
	if err != nil {
		return nil, err
	}

	repo, err := repository.New(ctx, config)
	if err != nil {
		return nil, err
	}

	repo.Version = version
	if version == "" {
		repo.Version = "undefined"
	} else {
		repo.Version = version
	}

	svc := service.NewService(repo)

	cms.EnsureDefaults(ctx, repo, repo.Logger)

	return &App{
		svc: svc,
	}, nil
}

func (a *App) swaggerHandler(w http.ResponseWriter, r *http.Request) {
	baseURIHeader := r.Header.Get("X-Client-BaseUri")

	switch baseURIHeader {
	case "/_stream-flow/":
		a.svc.Repo.Logger.Info("extra swagger")
		httpSwagger.Handler(httpSwagger.InstanceName(extraSwaggerInstanceName))(w, r)
	default:
		a.svc.Repo.Logger.Info("default swagger")
		httpSwagger.WrapHandler(w, r)
	}
}

func (a *App) setupAppRouter() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(chiprometheus.NewMiddleware("streamflow_cplane"))
	r.Use(a.svc.Repo.Logger.NewLoggerMiddleware())
	if a.svc.Repo.Config.UseCors {
		r.Use(cors.Handler(cors.Options{
			AllowedOrigins: []string{"*"},
			AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		}))
	}

	r.Get("/api/v1/swagger/*", a.swaggerHandler)

	var shouldDisableAuth bool
	disableAuth := os.Getenv("DisableAuth")
	if disableAuth == "true" {
		shouldDisableAuth = true
	}

	// API
	for _, def := range private.Definitions {
		switch def.Method {
		case http.MethodGet:
			r.Get(def.Path, shared.WrapHandler(def.Handler, a.svc, def.DisableAuth || shouldDisableAuth))
		case http.MethodPost:
			r.Post(def.Path, shared.WrapHandler(def.Handler, a.svc, def.DisableAuth || shouldDisableAuth))
		case http.MethodPut:
			r.Put(def.Path, shared.WrapHandler(def.Handler, a.svc, def.DisableAuth || shouldDisableAuth))
		case http.MethodDelete:
			r.Delete(def.Path, shared.WrapHandler(def.Handler, a.svc, def.DisableAuth || shouldDisableAuth))
		}
	}

	// Auth
	for _, def := range private.AuthDefinitions {
		switch def.Method {
		case http.MethodGet:
			r.Get(def.Path, shared.AuthWrapHandler(def.Handler, a.svc))
		case http.MethodPost:
			r.Post(def.Path, shared.AuthWrapHandler(def.Handler, a.svc))
		case http.MethodPut:
			r.Put(def.Path, shared.AuthWrapHandler(def.Handler, a.svc))
		case http.MethodDelete:
			r.Delete(def.Path, shared.AuthWrapHandler(def.Handler, a.svc))
		}
	}

	return r
}

func (a *App) setupMetricsRouter() http.Handler {
	router := httprouter.New()
	router.Handler(http.MethodGet, "/metrics", promhttp.Handler())

	return router
}

// Run Swagger
//
//	@title			Streamflow Control Plane API
//	@version		1.0
//	@contact.name	API Support
//	@contact.email	vladimir.petrov@vkteam.ru
//	@BasePath		/
func (a *App) Run() {
	appRouter := a.setupAppRouter()
	metricsRouter := a.setupMetricsRouter()

	extraSwagger := *private_docs.SwaggerInfo
	extraSwagger.BasePath = "/_stream-flow/"
	extraSwagger.InfoInstanceName = extraSwaggerInstanceName

	swag.Register(extraSwagger.InstanceName(), &extraSwagger)

	go func() {
		if err := http.ListenAndServe(fmt.Sprintf(":%d", a.svc.Repo.Config.MetricsPort), metricsRouter); err != nil {
			a.svc.Repo.Logger.Error("metrics handler error", err)
		}
	}()

	if err := http.ListenAndServe(fmt.Sprintf(":%d", a.svc.Repo.Config.AppPort), appRouter); err != nil {
		log.Fatal(err.Error())
	}
}
