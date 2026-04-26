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
	GetExperimentMetaFormParams(ctx context.Context) ([]params.Param, error)
	GetExperimentModelsFormParams(ctx context.Context) ([]params.Param, error)
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

func (fr *FormsRepo) GetExperimentMetaFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/Meta.json"

	return getFormParamsFromFile(formsPath)
}

func (fr *FormsRepo) GetExperimentModelsFormParams(ctx context.Context) ([]params.Param, error) {
	const formsPath = "/json/forms/experiment/Models.json"

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
