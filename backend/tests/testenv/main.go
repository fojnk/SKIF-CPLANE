package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/abc"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/idm"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/jobd"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/oauth"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/testenv/orchestrator"
)

func main() {
	log.Println("Starting testenv...")

	orchestrator := orchestrator.NewOrchestrator(":4000")
	abc := abc.NewServer(":4001")
	idm := idm.NewServer(":4004")
	jobdSrv := jobd.NewJobd(":4005")

	log.Println("Starting orchestrator...")
	if err := orchestrator.Start(); err != nil {
		log.Fatalf("Failed to start orchestrator: %v", err)
	}

	log.Println("Starting abc...")
	if err := abc.Start(); err != nil {
		log.Fatalf("Failed to start abc: %v", err)
	}

	log.Println("Starting idm...")
	if err := idm.Start(); err != nil {
		log.Fatalf("failed to start idm: %v", err)
	}

	log.Println("Starting jobd...")
	if err := jobdSrv.Start(); err != nil {
		log.Fatalf("failed to start jobd: %v", err)
	}

	log.Println("Starting oauth...")
	if err := oauth.Start(); err != nil {
		log.Fatalf("Failed to start oauth: %v", err)
	}

	log.Println("Orchestrator server started on :4000")
	log.Println("ABC server started on :4001")
	log.Println("IDM server started on :4004")
	log.Println("Jobd server started on :4005")

	log.Println("All servers started, waiting for shutdown signal...")
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	log.Println("Shutting down orchestrator...")
	if err := orchestrator.Stop(); err != nil {
		log.Fatalf("Failed to stop orchestrator: %v", err)
	}

	log.Println("Shutting down abc...")
	if err := abc.Stop(); err != nil {
		log.Fatalf("Failed to stop abc: %v", err)
	}

	log.Println("Shutting down idm...")
	if err := idm.Stop(); err != nil {
		log.Fatalf("Failed to stop idm: %v", err)
	}

	log.Println("Shutting down jobd...")
	if err := jobdSrv.Stop(); err != nil {
		log.Fatalf("Failed to stop jobd: %v", err)
	}
}
