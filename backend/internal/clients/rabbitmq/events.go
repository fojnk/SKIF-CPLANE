package rabbitmq

// Тело experiment.start / experiment.apply — JSON internal/pkg/supervisor.ExperimentRequest
// (совместим с ru.nsu…supervisor.model.RequestExperimentFromClient в skif_platform_supervisor).

// MessageExperimentStop — остановка пайплайна по идентификатору рантайма.
type MessageExperimentStop struct {
	ExperimentID           int32  `json:"experiment_id"`
	SupervisorExperimentID string `json:"supervisor_experiment_id"`
}
