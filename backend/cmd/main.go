package main

import (
	"context"
	"log"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/app"
)

func main() {
	serverApp, err := app.NewApp(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	serverApp.Run()
}
