package one_alerts

import (
	"context"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

type OneAlerts struct {
	server       *http.Server
	mu           sync.Mutex
	addr         string
	files        map[string]string
	integrations map[string]bool // productID -> exists
}

func NewOneAlerts(addr string) *OneAlerts {
	return &OneAlerts{
		addr:         addr,
		files:        make(map[string]string),
		integrations: make(map[string]bool),
	}
}

func (o *OneAlerts) Start() error {
	o.mu.Lock()
	defer o.mu.Unlock()

	mux := http.NewServeMux()

	mux.HandleFunc("/api/v2/files", func(w http.ResponseWriter, r *http.Request) {

		o.mu.Lock()
		defer o.mu.Unlock()

		token := r.Header.Get("X-Access-Token")
		if token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		fileName := r.Header.Get("X-File-Name")
		if fileName == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			content, exists := o.files[fileName]
			if !exists {
				w.WriteHeader(http.StatusNotFound)
				return
			}

			w.Header().Set("Content-Type", "application/yaml")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(content))
			return

		case http.MethodPost:
			body, err := io.ReadAll(r.Body)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			defer r.Body.Close()

			o.files[fileName] = string(body)
			w.WriteHeader(http.StatusOK)
			return

		case http.MethodPut:
			body, err := io.ReadAll(r.Body)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			defer r.Body.Close()

			if _, exists := o.files[fileName]; !exists {
				w.WriteHeader(http.StatusNotFound)
				return
			}

			o.files[fileName] = string(body)
			w.WriteHeader(http.StatusOK)
			return

		case http.MethodDelete:
			if _, exists := o.files[fileName]; !exists {
				w.WriteHeader(http.StatusNotFound)
				return
			}

			delete(o.files, fileName)
			w.WriteHeader(http.StatusOK)
			return

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
	})

	// Обработчик для проверки и управления интеграциями
	mux.HandleFunc("/api/v2/integrations/", func(w http.ResponseWriter, r *http.Request) {
		o.mu.Lock()
		defer o.mu.Unlock()

		token := r.Header.Get("X-Access-Token")
		if token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		// Извлекаем productID из пути
		productID := r.URL.Path[len("/api/v2/integrations/"):]
		if productID == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			// Проверка интеграции
			exists, ok := o.integrations[productID]
			if !ok || !exists {
				w.WriteHeader(http.StatusNotFound)
				return
			}
			w.WriteHeader(http.StatusOK)

		case http.MethodPost:
			// Регистрация интеграции (для тестов)
			o.integrations[productID] = true
			w.WriteHeader(http.StatusOK)

		case http.MethodDelete:
			// Удаление интеграции (для тестов)
			delete(o.integrations, productID)
			w.WriteHeader(http.StatusOK)

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	o.server = &http.Server{
		Addr:         o.addr,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	go func() {
		if err := o.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("one-alerts server error: %v\n", err)
		}
	}()

	return nil
}

func (o *OneAlerts) Stop() error {
	o.mu.Lock()
	defer o.mu.Unlock()

	if o.server != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return o.server.Shutdown(ctx)
	}

	return nil
}

// AddIntegration добавляет интеграцию для продукта (для использования в тестах)
func (o *OneAlerts) AddIntegration(productID string) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.integrations[productID] = true
}

// RemoveIntegration удаляет интеграцию для продукта (для использования в тестах)
func (o *OneAlerts) RemoveIntegration(productID string) {
	o.mu.Lock()
	defer o.mu.Unlock()
	delete(o.integrations, productID)
}

// ClearIntegrations очищает все интеграции (для использования в тестах)
func (o *OneAlerts) ClearIntegrations() {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.integrations = make(map[string]bool)
}
