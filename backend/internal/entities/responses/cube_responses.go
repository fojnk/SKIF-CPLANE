package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type CreateCubeResponse struct {
	dto.Cube
}

type UpdateCubeResponse struct {
	dto.Cube
}

type GetCubeResponse struct {
	dto.Cube
}

type ListCubesResponse struct {
	Cubes []dto.Cube `json:"cubes"`
}
