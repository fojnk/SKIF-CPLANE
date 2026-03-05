package orchestrator

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"sync"
)

// Orchestrator is a test server that simulates the orchestrator service
// for testing purposes
type Orchestrator struct {
	server *http.Server
	mu     sync.Mutex
	addr   string
}

func NewOrchestrator(addr string) *Orchestrator {
	return &Orchestrator{
		addr: addr,
	}
}

func (o *Orchestrator) Start() error {
	o.mu.Lock()
	defer o.mu.Unlock()

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()
		trimmed := strings.Trim(string(body), "\n")
		if trimmed != "{}" {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("{}"))
	})

	mux.HandleFunc("/v1/experiments/apply", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("{}"))
	})

	mux.HandleFunc("/v1/experiments/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		response := map[string]any{
			"last_updated":   1743506511,
			"overall_status": "running",
			"components_status": []map[string]string{
				{
					"name":   "TestComponent",
					"status": "running",
				},
			},
			"messages": []map[string]string{},
		}

		responseJson, _ := json.Marshal(response)
		w.WriteHeader(http.StatusOK)
		w.Write(responseJson)
	})

	mux.HandleFunc("/v1/experiments/info", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		response := map[string]any{
			"cloud_web_links": []map[string]string{
				{
					"name": "worker",
					"link": "https://cloud.vk.team/cloud/KC,PC/ns/infra/service/sf-dev-wrkr-pl-0.proj-0",
				},
				{
					"name": "resharder",
					"link": "https://cloud.vk.team/cloud/KC,PC/ns/infra/service/sf-dev-rsdr-pl-0.proj-0",
				},
			},
		}

		responseJson, _ := json.Marshal(response)
		w.WriteHeader(http.StatusOK)
		w.Write(responseJson)
	})

	o.server = &http.Server{
		Addr:    o.addr,
		Handler: mux,
	}

	go func() {
		_ = o.server.ListenAndServe()
	}()

	return nil
}

func (o *Orchestrator) Stop() error {
	o.mu.Lock()
	defer o.mu.Unlock()

	if o.server != nil {
		return o.server.Shutdown(context.Background())
	}
	return nil
}
