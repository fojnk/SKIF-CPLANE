package forms

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/params"
)

type Repo interface {
	GetDatasetFormParams(ctx context.Context, dsType string) ([]params.Param, error)
	GetProjectFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentFileStoragesFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentPlacementFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentResourcesFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentResharderFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentStatesFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentWorkerFormParams(ctx context.Context) ([]params.Param, error)
}

type FormsRepo struct {
}

func NewFormsRepo() *FormsRepo {
	return &FormsRepo{}
}

func (fr *FormsRepo) GetDatasetFormParams(ctx context.Context, dsType string) ([]params.Param, error) {
	const formsPath = "/json/forms/dataset"

	switch strings.ToLower(dsType) {
	case "kafka":
		return getFormParamsFromFile(fmt.Sprintf("%s/%s", formsPath, "DatasetKafka.json"))
	case "queue":
		return getFormParamsFromFile(fmt.Sprintf("%s/%s", formsPath, "DatasetQueue.json"))
	}

	return getFormParamsFromFile(fmt.Sprintf("%s/%s", formsPath, "Dataset.json"))
}

func (fr *FormsRepo) GetProjectFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/project/Project.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentFileStoragesFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/FileStorages.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentPlacementFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/Placement.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentResourcesFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/Resources.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentResharderFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/Resharder.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentStatesFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/States.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentWorkerFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/Worker.json"

	return getFormParamsFromFile(formsPath)
}

func getFormParamsFromFile(filepath string) ([]params.Param, error) {
	formParams := []params.Param{}

	formsData, err := os.ReadFile(filepath)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(formsData, &formParams); err != nil {
		return nil, err
	}

	return formParams, nil
}
