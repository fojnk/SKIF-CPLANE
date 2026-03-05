package requests

type GetNamespaceRequest struct {
	NamespaceID int32 `validate:"required"`
}

type GetNamespaceConfigRequest struct {
	ConfigID int32 `validate:"required"`
}

type ListNamespaceConfigsRequest struct {
	NamespaceID int32 `validate:"required"`
}

type UpdateNamespaceRequest struct {
	ID      int32  `json:"id" validate:"required"`
	Name    string `json:"name" validate:"max=10"`
	Config  string `json:"config"`
	Comment string `json:"comment"`
}

type DeleteNamespaceRequest struct {
	ID int32 `json:"id" validate:"required"`
}
type CreateNamespaceRequest struct {
	Name    string `json:"name" validate:"required,min=1,max=10"`
	Comment string `json:"comment"`
}

type CreateNamespaceRolesRequest struct {
}
