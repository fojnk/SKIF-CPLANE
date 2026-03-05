package app

import (
	"context"
	"fmt"
	"log"
	"net/http"

	chiprometheus "github.com/766b/chi-prometheus"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
	"github.com/swaggo/swag"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/config"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/docs/public_docs"
	_ "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/docs/public_docs"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/public"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

var publicSwaggerInstanceName = "public"
var exttraPublicSwaggerInstanceName = "extra-public-swagger"

type AppPublic struct {
	svc *service.Service
}

func NewAppPublic(ctx context.Context) (*AppPublic, error) {
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

	return &AppPublic{
		svc: svc,
	}, nil
}

func (a *AppPublic) swaggerHandler(w http.ResponseWriter, r *http.Request) {
	baseURIHeader := r.Header.Get("X-Client-BaseUri")

	switch baseURIHeader {
	case "/_stream-flow-public/":
		a.svc.Repo.Logger.Info("extra streamflow public swagger")
		httpSwagger.Handler(httpSwagger.InstanceName(exttraPublicSwaggerInstanceName))(w, r)
	default:
		a.svc.Repo.Logger.Info("public swagger")
		httpSwagger.Handler(httpSwagger.InstanceName(publicSwaggerInstanceName))(w, r)
	}
}

func (a *AppPublic) setupAppPublicRouter() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(chiprometheus.NewMiddleware("streamflow_cplane_public"))
	r.Use(a.svc.Repo.Logger.NewLoggerMiddleware())
	if a.svc.Repo.Config.UseCors {
		r.Use(cors.Handler(cors.Options{
			AllowedOrigins: []string{"*"},
			AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		}))
	}

	r.Get("/api/v1/swagger/*", a.swaggerHandler)

	for _, def := range public.Definitions {
		switch def.Method {
		case http.MethodGet:
			r.Get(def.Path, shared.PublicWrapHandler(def.Handler, a.svc, def.DisableAuth))
		case http.MethodPost:
			r.Post(def.Path, shared.PublicWrapHandler(def.Handler, a.svc, def.DisableAuth))
		case http.MethodPut:
			r.Put(def.Path, shared.PublicWrapHandler(def.Handler, a.svc, def.DisableAuth))
		case http.MethodDelete:
			r.Delete(def.Path, shared.PublicWrapHandler(def.Handler, a.svc, def.DisableAuth))
		}
	}

	return r
}

// Run Swagger
//
//	@title						Control Plane: Public API
//	@version					1.0
//	@contact.name				API Support
//	@contact.email				vladimir.petrov@vkteam.ru
//	@BasePath					/
//	@securityDefinitions.apikey	BearerAuth
//	@in							header
//	@name						Authorization
func (a *AppPublic) Run() {
	appPublicRouter := a.setupAppPublicRouter()

	extraSwagger := *public_docs.SwaggerInfopublic
	extraSwagger.BasePath = "/_stream-flow-public/"
	extraSwagger.InfoInstanceName = exttraPublicSwaggerInstanceName

	swag.Register(extraSwagger.InstanceName(), &extraSwagger)

	if err := http.ListenAndServe(fmt.Sprintf(":%d", a.svc.Repo.Config.AppPublicPort), appPublicRouter); err != nil {
		log.Fatal(err.Error())
	}
}
