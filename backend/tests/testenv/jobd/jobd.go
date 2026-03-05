package jobd

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Jobd is a lightweight test server that simulates the jobd service.
// В тестах нам достаточно, чтобы создание джобы успешно отрабатывало.
type Jobd struct {
	server *http.Server
	mu     sync.Mutex
	addr   string
}

func NewJobd(addr string) *Jobd {
	return &Jobd{
		addr: addr,
	}
}

func (j *Jobd) Start() error {
	j.mu.Lock()
	defer j.mu.Unlock()

	mux := http.NewServeMux()

	// Handle POST /api/v1/jobs (CreateJob) and GET /api/v1/jobs (ListJobs)
	mux.HandleFunc("/api/v1/jobs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		if r.Method == http.MethodPost {
			// CreateJob endpoint - return minimal required response per OpenAPI spec
			resp := map[string]any{
				"job": map[string]any{
					"id":   1,
					"name": "test-job",
					"type": "experiment_apply_config",
				},
			}

			body, _ := json.Marshal(resp)
			w.WriteHeader(http.StatusCreated)
			_, _ = w.Write(body)
			return
		}

		if r.Method == http.MethodGet {
			// ListJobs endpoint
			resp := map[string]any{
				"jobs": []map[string]any{
					{
						"id":                 1,
						"name":               "test-job-1",
						"type":               "experiment_apply_config",
						"created_at":         "2024-01-01T00:00:00Z",
						"updated_at":         "2024-01-01T00:10:00Z",
						"created_by":         "test-user",
						"entity_id":          123,
						"status_description": "завершено (успешное окончание)",
					},
					{
						"id":                 2,
						"name":               "test-job-2",
						"type":               "dataset_apply",
						"created_at":         "2024-01-01T01:00:00Z",
						"updated_at":         "2024-01-01T01:05:00Z",
						"created_by":         "test-user",
						"entity_id":          456,
						"status_description": "выполняется (процесс активен)",
					},
				},
				"total": 2,
			}

			body, _ := json.Marshal(resp)
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(body)
			return
		}

		w.WriteHeader(http.StatusMethodNotAllowed)
	})

	// Handle /api/v1/jobs/search (for backward compatibility with control plane's POST handler)
	mux.HandleFunc("/api/v1/jobs/search", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		// Return a list of jobs
		resp := map[string]any{
			"jobs": []map[string]any{
				{
					"id":                 1,
					"name":               "test-job-1",
					"type":               "experiment_apply_config",
					"created_at":         "2024-01-01T00:00:00Z",
					"updated_at":         "2024-01-01T00:10:00Z",
					"created_by":         "test-user",
					"entity_id":          123,
					"status_description": "завершено (успешное окончание)",
					"config": map[string]any{
						"experiment_id": 123,
					},
				},
				{
					"id":                 2,
					"name":               "test-job-2",
					"type":               "dataset_apply",
					"created_at":         "2024-01-01T01:00:00Z",
					"updated_at":         "2024-01-01T01:05:00Z",
					"created_by":         "test-user",
					"entity_id":          456,
					"status_description": "выполняется (процесс активен)",
					"config": map[string]any{
						"experiment_id": 456,
					},
				},
			},
			"total": 2,
		}

		body, _ := json.Marshal(resp)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(body)
	})

	// Handle GET /api/v1/jobs/{id} (get job by ID)
	mux.HandleFunc("/api/v1/jobs/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("jobd mock: %s %s\n", r.Method, r.URL.Path)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		// Extract job ID from path (e.g., /api/v1/jobs/1 or /api/v1/jobs/1/events)
		// For now, we'll return a fixed response regardless of ID

		// Check if it's a sub-resource request
		if strings.Contains(r.URL.Path, "/events") {
			// Handle GET /api/v1/jobs/{id}/events
			if r.Method != http.MethodGet {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}

			resp := map[string]any{
				"events": []map[string]any{
					{
						"id":        1,
						"job_id":    1,
						"timestamp": "2024-01-01T00:00:00Z",
						"details": map[string]any{
							"message": "Job started",
						},
					},
					{
						"id":        2,
						"job_id":    1,
						"timestamp": "2024-01-01T00:10:00Z",
						"details": map[string]any{
							"message": "Job completed successfully",
						},
					},
				},
				"total": 2,
			}

			body, _ := json.Marshal(resp)
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(body)
			return
		}

		if strings.Contains(r.URL.Path, "/tasks") {
			// Handle GET /api/v1/jobs/{id}/tasks
			if r.Method != http.MethodGet {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}

			resp := map[string]any{
				"tasks": []map[string]any{
					{
						"id":          1,
						"job_id":      1,
						"name":        "task-1",
						"created_at":  "2024-01-01T00:00:00Z",
						"started_at":  "2024-01-01T00:00:10Z",
						"finished_at": "2024-01-01T00:05:00Z",
					},
					{
						"id":          2,
						"job_id":      1,
						"name":        "task-2",
						"created_at":  "2024-01-01T00:05:00Z",
						"started_at":  "2024-01-01T00:05:10Z",
						"finished_at": "2024-01-01T00:10:00Z",
					},
				},
			}

			body, _ := json.Marshal(resp)
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(body)
			return
		}

		if strings.Contains(r.URL.Path, "/cancel") {
			// Handle POST /api/v1/jobs/{id}/cancel
			if r.Method != http.MethodPost {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}

			resp := map[string]any{
				"job": map[string]any{
					"id":                 1,
					"name":               "test-job-1",
					"type":               "experiment_apply_config",
					"created_at":         "2024-01-01T00:00:00Z",
					"updated_at":         "2024-01-01T00:10:00Z",
					"created_by":         "test-user",
					"entity_id":          123,
					"status_description": "отменено (прервано пользователем/системой)",
					"config": map[string]any{
						"experiment_id": 123,
					},
				},
			}

			body, _ := json.Marshal(resp)
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(body)
			return
		}

		if strings.Contains(r.URL.Path, "/retry") {
			// Handle POST /api/v1/jobs/{id}/retry
			if r.Method != http.MethodPost {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}

			resp := map[string]any{
				"job": map[string]any{
					"id":                 1,
					"name":               "test-job-1",
					"type":               "experiment_apply_config",
					"created_at":         "2024-01-01T00:00:00Z",
					"updated_at":         "2024-01-01T00:10:00Z",
					"created_by":         "test-user",
					"entity_id":          123,
					"status_description": "ожидание (создано, но ещё не готово к выполнению)",
					"config": map[string]any{
						"experiment_id": 123,
					},
				},
			}

			body, _ := json.Marshal(resp)
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(body)
			return
		}

		// Handle GET /api/v1/jobs/{id} (get job by ID)
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		resp := map[string]any{
			"job": map[string]any{
				"id":                 1,
				"name":               "test-job-1",
				"type":               "experiment_apply_config",
				"created_at":         "2024-01-01T00:00:00Z",
				"updated_at":         "2024-01-01T00:10:00Z",
				"created_by":         "test-user",
				"entity_id":          123,
				"status_description": "завершено (успешное окончание)",
				"config": map[string]any{
					"experiment_id": 123,
				},
			},
		}

		body, _ := json.Marshal(resp)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(body)
	})

	j.server = &http.Server{
		Addr:         j.addr,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	go func() {
		_ = j.server.ListenAndServe()
	}()

	return nil
}

func (j *Jobd) Stop() error {
	j.mu.Lock()
	defer j.mu.Unlock()

	if j.server != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return j.server.Shutdown(ctx)
	}

	return nil
}
