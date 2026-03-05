package requests

type GetOrchestratorConfigRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}
