package dto

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"

type User struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
}

type UserGroup struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
}

type UserRights struct {
	ID     int32       `json:"id"`
	Name   string      `json:"name"`
	Rights []acl.Right `json:"rights"`
}
