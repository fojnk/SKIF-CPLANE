package requests

type GetSupervisorConfigRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}
