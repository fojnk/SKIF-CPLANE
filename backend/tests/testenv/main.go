package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/abc"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/oauth"
)

func main() {
	log.Println("Starting testenv...")

	abcSrv := abc.NewServer(":4001")

	log.Println("Starting abc...")
	if err := abcSrv.Start(); err != nil {
		log.Fatalf("Failed to start abc: %v", err)
	}

	log.Println("Starting oauth...")
	if err := oauth.Start(); err != nil {
		log.Fatalf("Failed to start oauth: %v", err)
	}

	log.Println("ABC server started on :4001")
	log.Println("All servers started, waiting for shutdown signal...")
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	log.Println("Shutting down abc...")
	if err := abcSrv.Stop(); err != nil {
		log.Fatalf("Failed to stop abc: %v", err)
	}
}
