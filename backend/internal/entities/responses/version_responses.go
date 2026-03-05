package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type ListExperimentVersionsResponse struct {
	Pages    int64                 `json:"pages"`
	Total    int64                 `json:"total"`
	Versions []dto.ExperimentVersion `json:"versions"`
}

type ListExperimentVariableVersionsResponse struct {
	Pages    int64                         `json:"pages"`
	Total    int64                         `json:"total"`
	Versions []dto.ExperimentVariableVersion `json:"versions"`
}

type ListDatasetVersionsResponse struct {
	Pages    int64                   `json:"pages"`
	Total    int64                   `json:"total"`
	Versions []dto.DatasetVersion `json:"versions"`
}

type CurrentExperimentVersionResponse struct {
	VersionID int32 `json:"version_id"`
}
type CurrentExperimentVariableVersionResponse struct {
	VersionID int32 `json:"version_id"`
}

type CurrentDatasetVersionResponse struct {
	VersionID int32 `json:"version_id"`
}
