package idm

import (
	"context"
	"fmt"
	"net/http"
)

type IDM struct {
	server *http.Server
}

var defaultResponse = `
		{
		"meta": {
				"next":null,
				"previous":null,
				"pages_count":1,
				"objects_count":1
			},
		"objects":[
			{
				"username":"vladimir.petrov",
				"permissions":["streamflow_owner"]
			}
			]
		}`

func NewServer(addr string) *IDM {
	router := http.NewServeMux()
	router.HandleFunc("/account_permissions", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("idm request", r.URL.Path)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(defaultResponse))
	})

	return &IDM{
		server: &http.Server{
			Addr:    addr,
			Handler: router,
		},
	}
}

func (o *IDM) Start() error {
	go func() {
		if err := o.server.ListenAndServe(); err != nil {
			fmt.Println("idm server error", err)
		}
	}()

	return nil
}

func (o *IDM) Stop() error {
	return o.server.Shutdown(context.Background())
}
