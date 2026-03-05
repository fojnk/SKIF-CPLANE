package public

import (
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/setters"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/private"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
)

var Definitions = []shared.Definition{
	// Project
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(createProjectHandler, setters.EmptySetParam[requests.CreateProjectRequest], validation.DefaultValidate[requests.CreateProjectRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/projects",
		Handler: shared.CreateHandler(listProjectsHandler, setters.SetListProjectRequestParams, validation.DefaultValidate[requests.ListProjectsRequest], "namespace_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/projects",
		Handler: shared.CreateHandler(listProjectsPostHandlerV2, setters.EmptySetParam[requests.ListProjectsRequestV2], validation.DefaultValidate[requests.ListProjectsRequestV2]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(getProjectHandler, setters.SetGetProjectRequestParams, validation.DefaultValidate[requests.GetProjectRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(deleteProjectHandler, setters.EmptySetParam[requests.DeleteProjectRequest], validation.DefaultValidate[requests.DeleteProjectRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(updateProjectHandler, setters.EmptySetParam[requests.UpdateProjectRequest], validation.DefaultValidate[requests.UpdateProjectRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/project/config",
		Handler: shared.CreateHandler(getProjectConfigHandler, setters.SetGetProjectConfigRequestParams, validation.DefaultValidate[requests.GetProjectConfigRequest], "config_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project/logs",
		Handler: shared.CreateHandler(listProjectUpdateLogsHandler, setters.SetListProjectUpdateLogsRequestParams, validation.ValidateListProjectUpdateLogsRequest, "project_id", "namespace_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project/log",
		Handler: shared.CreateHandler(getProjectLogHandler, setters.SetGetProjectLogRequestParams, validation.DefaultValidate[requests.GetProjectLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	// CompleteExperiment
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(createCompleteExperimentHandler, setters.EmptySetParam[requests.CreateCompleteExperimentRequest], validation.DefaultValidate[requests.CreateCompleteExperimentRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiments",
		Handler: shared.CreateHandler(listCompleteExperimentsHandler, setters.SetListCompleteExperimentsRequestParams, validation.DefaultValidate[requests.ListCompleteExperimentsRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(getCompleteExperimentHandler, setters.SetGetCompleteExperimentRequestParams, validation.DefaultValidate[requests.GetCompleteExperimentRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(deleteCompleteExperimentHandler, setters.EmptySetParam[requests.DeleteCompleteExperimentRequest], validation.DefaultValidate[requests.DeleteCompleteExperimentRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(updateCompleteExperimentHandler, setters.EmptySetParam[requests.UpdateCompleteExperimentRequest], validation.ValidateUpdateExperimentRequest),
		Method:  http.MethodPut,
	},
	// Experiment actions
	{
		Path:    "/api/v1/experiment/start",
		Handler: shared.CreateHandler(ExperimentStartHandler, setters.EmptySetParam[requests.ExperimentStartRequest], validation.DefaultValidate[requests.ExperimentStartRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/updates",
		Handler: shared.CreateHandler(ExperimentCheckUpdateConfigHandler, setters.SetExperimentCheckConfigRequestParams, validation.DefaultValidate[requests.ExperimentCheckUpdateRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/stop",
		Handler: shared.CreateHandler(ExperimentStopHandler, setters.EmptySetParam[requests.ExperimentStopRequest], validation.DefaultValidate[requests.ExperimentStopRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/status",
		Handler: shared.CreateHandler(ExperimentStatusHandler, setters.SetExperimentStatusRequestParams, validation.DefaultValidate[requests.ExperimentStatusRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/config/apply",
		Handler: shared.CreateHandler(private.ApplyExperimentConfigV2Handler, setters.EmptySetParam[requests.ApplyExperimentConfigRequest], validation.DefaultValidate[requests.ApplyExperimentConfigRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/config/validate",
		Handler: shared.CreateHandler(validateExperimentConfigHandler, setters.EmptySetParam[requests.CompleteExperimentValidateRequest], validation.DefaultValidate[requests.CompleteExperimentValidateRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/dataset",
		Handler: shared.CreateHandler(addDatasetToExperimentHandler, setters.EmptySetParam[requests.AddDatasetToExperimentRequest], validation.DefaultValidate[requests.AddDatasetToExperimentRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/dataset",
		Handler: shared.CreateHandler(removeDatasetFromExperimentHandler, setters.EmptySetParam[requests.RemoveDatasetFromExperimentRequest], validation.DefaultValidate[requests.RemoveDatasetFromExperimentRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/experiment/datasets",
		Handler: shared.CreateHandler(getExperimentDatasetsHandler, setters.SetGetExperimentDatasetsRequestParams, validation.DefaultValidate[requests.GetExperimentDatasetsRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/experiment/search/datasets",
		Handler: shared.CreateHandler(getExperimentAvailableDatasetsToLinkHandler, setters.EmptySetParam[requests.GetExperimentAvailableDatasetsToLinkRequest], validation.DefaultValidate[requests.GetExperimentAvailableDatasetsToLinkRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/dataset",
		Handler: shared.CreateHandler(updateExperimentDatasetHandler, setters.EmptySetParam[requests.UpdateExperimentDatasetRequest], validation.DefaultValidate[requests.UpdateExperimentDatasetRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/experiment/dataset",
		Handler: shared.CreateHandler(removeDatasetFromExperimentV2Handler, setters.EmptySetParam[requests.RemoveDatasetFromExperimentV2Request], validation.DefaultValidate[requests.RemoveDatasetFromExperimentV2Request]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v2/experiment/dataset",
		Handler: shared.CreateHandler(updateExperimentDatasetV2Handler, setters.EmptySetParam[requests.UpdateExperimentDatasetV2Request], validation.DefaultValidate[requests.UpdateExperimentDatasetV2Request]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/experiment/dataset",
		Handler: shared.CreateHandler(getExperimentDatasetV2Handler, setters.SetGetExperimentDatasetV2RequestParams, validation.DefaultValidate[requests.GetDatasetFromExperimentV2Request], "experiment_id", "alias"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/logs",
		Handler: shared.CreateHandler(listExperimentUpdateLogsHandler, setters.SetListExperimentUpdateLogsRequestParams, validation.ValidateListExperimentUpdateLogsRequest, "experiment_id", "project_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/versions",
		Handler: shared.CreateHandler(listExperimentConfigVersionsHandler, setters.SetListExperimentVersionsRequestParams, validation.ValidateListExperimentVersionsRequest, "experiment_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/version",
		Handler: shared.CreateHandler(getExperimentConfigByVersionHandler, setters.SetGetExperimentConfigVersionRequestParams, validation.ValidateGetExperimentVersionsRequest, "experiment_id", "version_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/version/current",
		Handler: shared.CreateHandler(getExperimentCurrentConfigVersionHandler, setters.SetGetExperimentCurrentVersionRequestParams, validation.ValidateGetExperimentCurrentVersionsRequest, "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/version/current",
		Handler: shared.CreateHandler(updateExperimentConfigVersionHandler, setters.EmptySetParam[requests.UpdateExperimentConfigVersionRequest], validation.DefaultValidate[requests.UpdateExperimentConfigVersionRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/log",
		Handler: shared.CreateHandler(getExperimentLogHandler, setters.SetGetExperimentLogRequestParams, validation.DefaultValidate[requests.GetExperimentLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variables",
		Handler: shared.CreateHandler(getExperimentVariablesHandler, setters.SetGetExperimentVariablesRequestParams, validation.DefaultValidate[requests.GetExperimentVariablesRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(getExperimentVariableHandler, setters.SetGetExperimentVariableRequestParams, validation.DefaultValidate[requests.GetExperimentVariableRequest], "variable_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(updateExperimentVariableHandler, setters.EmptySetParam[requests.UpdateExperimentVariableRequest], validation.DefaultValidate[requests.UpdateExperimentVariableRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(createExperimentVariableHandler, setters.EmptySetParam[requests.CreateExperimentVariableRequest], validation.DefaultValidate[requests.CreateExperimentVariableRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/variables/types",
		Handler: shared.CreateHandler(getAvailableExperimentVariableTypesHandler, setters.EmptySetParam[requests.GetAvailableExperimentVariableTypesRequest], validation.DefaultValidate[requests.GetAvailableExperimentVariableTypesRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(deleteExperimentVariableHandler, setters.EmptySetParam[requests.DeleteExperimentVariableRequest], validation.DefaultValidate[requests.DeleteExperimentVariableRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v2/experiment/variable",
		Handler: shared.CreateHandler(getExperimentVariableV2Handler, setters.SetGetExperimentVariableV2RequestParams, validation.DefaultValidate[requests.GetExperimentVariableV2Request], "experiment_id", "name"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/experiment/variable",
		Handler: shared.CreateHandler(updateExperimentVariableV2Handler, setters.EmptySetParam[requests.UpdateExperimentVariableV2Request], validation.DefaultValidate[requests.UpdateExperimentVariableV2Request]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/experiment/variable",
		Handler: shared.CreateHandler(deleteExperimentVariableV2Handler, setters.EmptySetParam[requests.DeleteExperimentVariableV2Request], validation.DefaultValidate[requests.DeleteExperimentVariableV2Request]),
		Method:  http.MethodDelete,
	},
	// Dataset
	{
		Path:    "/api/v2/dataset",
		Handler: shared.CreateHandler(createDatasetHandlerV2, setters.EmptySetParam[requests.CreateDatasetRequestV2], validation.DefaultValidate[requests.CreateDatasetRequestV2]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/datasets/search",
		Handler: shared.CreateHandler(searchDatasetsPostHandler, setters.EmptySetParam[requests.SearchDatasetsRequest], validation.DefaultValidate[requests.SearchDatasetsRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/datasets",
		Handler: shared.CreateHandler(listDatasetsByProjectIdHandler, setters.SetListDatasetsByProjectRequestParams, validation.DefaultValidate[requests.ListDatasetsByProjectRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset",
		Handler: shared.CreateHandler(getDatasetV2Handler, setters.SetGetDatasetRequestParams, validation.DefaultValidate[requests.GetDatasetRequest], "dataset_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/dataset",
		Handler: shared.CreateHandler(deleteDatasetHandler, setters.EmptySetParam[requests.DeleteDatasetRequest], validation.DefaultValidate[requests.DeleteDatasetRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v2/dataset",
		Handler: shared.CreateHandler(updateDatasetHandlerV2, setters.EmptySetParam[requests.UpdateDatasetRequestV2], validation.DefaultValidate[requests.UpdateDatasetRequestV2]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/dataset/logs",
		Handler: shared.CreateHandler(listDatasetUpdateLogsByProjectHandler, setters.SetListDatasetUpdateLogsByProjectRequestParams, validation.ValidateListDatasetUpdateLogsByProjectRequest, "dataset_id", "project_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/dataset/log",
		Handler: shared.CreateHandler(getDatasetLogHandler, setters.SetGetDatasetLogRequestParams, validation.DefaultValidate[requests.GetDatasetLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/links",
		Handler: shared.CreateHandler(getDatasetLinkedExperimentsHandler, setters.SetGetDatasetLinkedExperimentsRequestParams, validation.DefaultValidate[requests.GetDatasetLinkedExperimentsRequest], "dataset_id", "offset", "limit"),
		Method:  http.MethodGet,
	},
	// Schema
	{
		Path:    "/api/v2/schema",
		Handler: shared.CreateHandler(getConfigSchemaHandler, setters.SetGetSchema, validation.DefaultValidate[requests.GetSchemaRequest], "config_type"),
		Method:  http.MethodGet,
	},
	// Cube
	{
		Path:    "/api/v1/cube/system",
		Handler: shared.CreateHandler(createSystemCube, setters.EmptySetParam[requests.CreateCubeRequest], validation.ValidateCreateCubeRequest),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/cube",
		Handler: shared.CreateHandler(getCubeByID, setters.SetGetCubeRequestParams, validation.DefaultValidate[requests.GetCubeRequest], "cube_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/cube",
		Handler: shared.CreateHandler(updateCube, setters.EmptySetParam[requests.UpdateCubeRequest], validation.ValidateUpdateCubeRequest),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/cube/name",
		Handler: shared.CreateHandler(getCubeByName, setters.SetGetCubeByNameRequestParams, validation.DefaultValidate[requests.GetCubeByNameRequest], "name"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/cubes",
		Handler: shared.CreateHandler(listCubes, setters.EmptySetParam[requests.ListCubesRequest], validation.DefaultValidate[requests.ListCubesRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/validations/fast",
		Handler: shared.CreateHandler(validateExperimentFastHandler, setters.EmptySetParam[requests.ExperimentValidateFastRequest], validation.DefaultValidate[requests.ExperimentValidateFastRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/validations/run",
		Handler: shared.CreateHandler(validateExperimentRunHandler, setters.EmptySetParam[requests.ExperimentValidateRunRequest], validation.DefaultValidate[requests.ExperimentValidateRunRequest]),
		Method:  http.MethodPost,
	},
}
