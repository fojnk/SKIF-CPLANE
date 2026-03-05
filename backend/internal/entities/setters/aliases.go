package setters

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"

func normalizeParamName(name string) string {
	switch name {
	case "experiment_id":
		return "experiment_id"
	case "workspace_id":
		return "namespace_id"
	case "model_id":
		return "experiment_id"
	case "dataset_id":
		return "dataset_id"
	case "model_ids":
		return "experiment_ids"
	default:
		return name
	}
}

func normalizeConfigTypeAlias(configType string) string {
	switch configType {
	case "experiment":
		return "experiment"
	case "workspace":
		return "namespace"
	case "model":
		return "experiment"
	case "dataset":
		return "dataset"
	case "dataset_schema":
		return "dataset_schema"
	default:
		return configType
	}
}

func normalizeObjectTypeAlias(objectType string) string {
	return requests.NormalizeObjectTypeAlias(objectType)
}
