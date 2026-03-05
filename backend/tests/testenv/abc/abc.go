package abc

import (
	"context"
	"fmt"
	"net/http"
)

type ABC struct {
	server *http.Server
}

var defaultResponse = `
{
     "members": [
          {
               "roles": [
                    {
                         "id": 13932,
                         "name": "Разработчик"
                    }
               ],
               "userLogin": "test-syncer-user-1"
          },
          {
               "roles": [
                    {
                         "id": 13933,
                         "name": "Разработчик"
                    }
               ],
               "userLogin": "test-syncer-user-2"
          }
     ],
     "productId": 4364
}`

func NewServer(addr string) *ABC {
	router := http.NewServeMux()
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("abc request", r.URL.Path)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(defaultResponse))
	})

	return &ABC{
		server: &http.Server{
			Addr:    addr,
			Handler: router,
		},
	}
}

func (o *ABC) Start() error {
	go func() {
		if err := o.server.ListenAndServe(); err != nil {
			fmt.Println("abc server error", err)
		}
	}()

	return nil
}

func (o *ABC) Stop() error {
	return o.server.Shutdown(context.Background())
}
