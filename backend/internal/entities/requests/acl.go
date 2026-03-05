package requests

import "strings"

type CheckACLRequest struct {
	ObjectType string `validate:"required,oneof=experiment dataset project namespace cube model dataset experiment workspace"`
	ObjectID   int32  `validate:"required"`
}

type UsersACLRequest struct {
	ObjectType string `validate:"required,oneof=experiment dataset project namespace cube model dataset experiment workspace"`
	ObjectID   int32  `validate:"required"`
	Search     string `json:"search"`
	Offset     *int32 `validate:"required"`
	Limit      int32  `validate:"required,min=1,max=100"`
}

func NormalizeObjectTypeAlias(v string) string {
	switch strings.ToLower(v) {
	case "model":
		return "cube"
	case "dataset":
		return "dataset"
	case "experiment":
		return "experiment"
	case "workspace":
		return "namespace"
	default:
		return v
	}
}
