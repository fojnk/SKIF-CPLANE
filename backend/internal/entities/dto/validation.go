package dto

// ValidationRequestDataItem represents a data item for validation
type ValidationRequestDataItem struct {
	SourceName string `json:"source_name"`
	OutputName string `json:"output_name,omitempty"`
	Data       string `json:"data"`
}

// ValidationError represents a validation error
type ValidationError struct {
	EntityType   string `json:"entity_type"`
	EntityName   string `json:"entity_name"`
	ErrorMessage string `json:"error_message"`
	ConfigPos    *int   `json:"config_pos,omitempty"`
}

// LogRecord represents a log record
type LogRecord struct {
	EntityType string   `json:"entity_type"`
	EntityName string   `json:"entity_name"`
	Records    []string `json:"records"`
}

// ValidationResponse represents the response from fast validation
type ValidationResponse struct {
	ExperimentIsValid bool              `json:"experiment_is_valid"`
	Summary         *string           `json:"summary,omitempty"`
	Errors          []ValidationError `json:"errors"`
	Logs            []LogRecord       `json:"logs"`
}

// ValidationResponseWithRun represents the response from validation with run
type ValidationResponseWithRun struct {
	ExperimentIsValid bool       `json:"experiment_is_valid" example:"true"`
	Summary         *string    `json:"summary,omitempty" example:"debug-run completed"`
	Errors          []string   `json:"errors" example:"error1"`
	RunResult       RunResults `json:"run_result,omitempty"`
	Logs            []string   `json:"logs"`
}

// ValidationErrorResponse represents error response for validation
type ValidationErrorResponse struct {
	ExperimentIsValid bool     `json:"experiment_is_valid" example:"false"`
	Errors          []string `json:"errors" example:"error1"`
}

// RunResults represents the results of a experiment run
type RunResults struct {
	BatchRuns []BatchRunResult `json:"batch_runs,omitempty"`
}

// BatchRunResult represents the result of a batch run
type BatchRunResult struct {
	CubeRuns map[string]CubeRunResult `json:"cube_runs,omitempty"`
}

// CubeRunResult represents the result of a cube run
type CubeRunResult struct {
	Inputs  map[string]string `json:"inputs" swaggertype:"object,string" example:"input_data:[{\"id\"=1};{\"id\"=2}]"`
	Outputs map[string]string `json:"outputs" swaggertype:"object,string" example:"data:[{\"id\"=1};{\"id\"=2}]"`
	Logs    []string          `json:"logs"`
}
