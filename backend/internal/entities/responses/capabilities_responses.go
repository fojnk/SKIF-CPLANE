package responses

type UserCapabilities struct {
	CanCreateNamespace bool `json:"can_create_namespace"`
	CanManageACL       bool `json:"can_manage_acl"`
	IsRoot             bool `json:"is_root"`
}

type UserCapabilitiesResponse struct {
	Capabilities UserCapabilities `json:"capabilities"`
}
