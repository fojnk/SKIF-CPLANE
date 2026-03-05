package main

import (
	"context"
	"log"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/app"
)

func main() {
	serverApp, err := app.NewApp(context.Background()) // TODO: make it an argument parameter
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		serverAppPublic, err := app.NewAppPublic(context.Background()) // TODO: make it an argument parameter
		if err != nil {
			log.Fatal(err)
		}

		serverAppPublic.Run()
	}()

	serverApp.Run()
}
