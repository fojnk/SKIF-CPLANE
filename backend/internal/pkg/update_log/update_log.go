package update_log

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/sergi/go-diff/diffmatchpatch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/metrics"
)

type Action string

const (
	ActionNew    Action = "new"
	ActionUpdate Action = "update"
	ActionDelete Action = "delete"

	ActionStartExperiment        Action = "start"
	ActionStopExperiment         Action = "stop"
	ActionApplyExperiment        Action = "apply"
	ActionDatasetAdd        Action = "new dataset"
	ActionDatasetDelete     Action = "delete dataset"
	ActionNewDatasetLink    Action = "new dataset link"
	ActionDeleteDatasetLink Action = "delete dataset link"
	ActionUpdateDatasetLink Action = "update dataset link"
	ActionNewVariable          Action = "new variable"
	ActionUpdateVariable       Action = "update variable"
	ActionDeleteVariable       Action = "delete variable"
)

func FindDiff(config1 string, config2 string) string {
	dmp := diffmatchpatch.New()
	diffs := dmp.DiffMain(config1, config2, false)
	return dmp.DiffPrettyText(diffs)
}

type DiffNamespace struct {
	Config string `json:"config"`
}

type NamespaceUpdateLog struct {
	New Namespace `json:"new,omitempty"`
	Old Namespace `json:"old,omitempty"`
}

type Namespace struct {
	Name            string `json:"name,omitempty"`
	ConfigVersionID int32  `json:"config_version_id,omitempty"`
	Config          string `json:"config,omitempty"`

	VariableName  string `json:"variable_name,omitempty"`
	VariableValue string `json:"variable_value,omitempty"`
	VariableType  string `json:"variable_type,omitempty"`
}

func NewNamespaceLog(ctx context.Context, db db.DB, l *logger.Logger, namespaceID int32, username, comment string, act Action, details NamespaceUpdateLog) {
	newLog := details

	// if nothing changed, don't log it
	if details.New.Config == details.Old.Config {
		newLog.New.Config = ""
		newLog.Old.Config = ""
	}

	logJSON, err := json.Marshal(newLog)
	if err != nil {
		l.Error("failed to marshal namespace update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
		return
	}

	if err = db.InsertNamespaceUpdateLog(ctx, core.InsertNamespaceUpdateLogParams{
		NamespaceID: namespaceID,
		Username:    username,
		Act:         string(act),
		Details:     logJSON,
		Comment:     comment,
	}); err != nil {
		metrics.LogErrors.WithLabelValues().Inc()
		l.Error("failed to insert namespace update log", err)
	}
}

type DiffProject struct {
	Config      string `json:"config"`
	Description string `json:"description"`
}

type ProjectUpdateLog struct {
	New Project `json:"new,omitempty"`
	Old Project `json:"old,omitempty"`
}

type Project struct {
	Name            string `json:"name,omitempty"`
	ConfigVersionID int32  `json:"config_version_id,omitempty"`
	Config          string `json:"config,omitempty"`
	Description     string `json:"description,omitempty"`

	VariableName  string `json:"variable_name,omitempty"`
	VariableValue string `json:"variable_value,omitempty"`
	VariableType  string `json:"variable_type,omitempty"`
}

func NewProjectLog(ctx context.Context, db db.DB, l *logger.Logger, namespaceID int32, projectID int32, username, comment string, act Action, details ProjectUpdateLog) {
	newLog := details

	// if nothing changed, don't log it
	if details.New.Config == details.Old.Config {
		newLog.New.Config = ""
		newLog.Old.Config = ""
	}

	if details.New.Description == details.Old.Description {
		newLog.New.Description = ""
		newLog.Old.Description = ""
	}

	logJSON, err := json.Marshal(newLog)
	if err != nil {
		l.Error("failed to marshal project update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
		return
	}

	if err = db.InsertProjectUpdateLog(ctx, core.InsertProjectUpdateLogParams{
		NamespaceID: namespaceID,
		ProjectID:   projectID,
		Username:    username,
		Act:         string(act),
		Details:     logJSON,
		Comment:     comment,
	}); err != nil {
		l.Error("failed to insert project update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
	}
}

type DiffDataset struct {
	Schema string `json:"schema"`
	Params string `json:"params"`
}

type DatasetUpdateLog struct {
	New Dataset `json:"new,omitempty"`
	Old Dataset `json:"old,omitempty"`
}

type Dataset struct {
	Name    string `json:"name,omitempty"`
	Schema  string `json:"schema,omitempty"`
	Params  string `json:"params,omitempty"`
	Type    string `json:"type,omitempty"`
	Public  bool   `json:"public"`
	Managed bool   `json:"managed"`
	JobID   *int64 `json:"job_id,omitempty"`
}

func NewDatasetLog(ctx context.Context, db db.DB, l *logger.Logger, namespaceID int32, projectID pgtype.Int4, datasetID int32, username, comment string, act Action, details DatasetUpdateLog) {
	newLog := details

	// if nothing changed, don't log it
	if details.New.Schema == details.Old.Schema {
		newLog.New.Schema = ""
		newLog.Old.Schema = ""
	}

	if details.New.Params == details.Old.Params {
		newLog.New.Params = ""
		newLog.Old.Params = ""
	}

	logJSON, err := json.Marshal(newLog)
	if err != nil {
		l.Error("failed to marshal dataset update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
		return
	}

	if err = db.InsertDatasetUpdateLog(ctx, core.InsertDatasetUpdateLogParams{
		NamespaceID:  namespaceID,
		DatasetID: datasetID,
		ProjectID:    projectID,
		Username:     username,
		Act:          string(act),
		Details:      logJSON,
		Comment:      comment,
	}); err != nil {
		l.Error("failed to insert dataset update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
	}
}

type DiffExperiment struct {
	Config        string `json:"config"`
	VariableValue string `json:"variable_value"`
}

type ExperimentUpdateLog struct {
	New Experiment `json:"new,omitempty"`
	Old Experiment `json:"old,omitempty"`
}

type Experiment struct {
	Name            string `json:"name,omitempty"`
	Config          string `json:"config,omitempty"`
	DatasetID    int32  `json:"dataset_id,omitempty"`
	DatasetAlias string `json:"dataset_alias,omitempty"`
	Description     string `json:"description,omitempty"`
	JobID *int64 `json:"job_id,omitempty"`

	VariableName  string `json:"variable_name,omitempty"`
	VariableValue string `json:"variable_value,omitempty"`
	VariableType  string `json:"variable_type,omitempty"`
}

func NewExperimentLog(ctx context.Context, db db.DB, l *logger.Logger, projectID int32, experimentID int32, username, comment string, act Action, details ExperimentUpdateLog) {
	if act == ActionNewVariable {
		l.Info(fmt.Sprintf("new variable: %s, experimentID: %d", details.New.VariableName, experimentID))
	}
	newLog := details

	// if nothing changed, don't log it
	if details.New.Config == details.Old.Config {
		newLog.New.Config = ""
		newLog.Old.Config = ""
	}

	if details.New.VariableValue == details.Old.VariableValue {
		newLog.New.VariableValue = ""
		newLog.Old.VariableValue = ""
	}

	logJSON, err := json.Marshal(newLog)
	if err != nil {
		l.Error("failed to marshal experiment update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
		return
	}

	if err = db.InsertExperimentUpdateLog(ctx, core.InsertExperimentUpdateLogParams{
		ProjectID:  projectID,
		ExperimentID: experimentID,
		Username:   username,
		Act:        string(act),
		Details:    logJSON,
		Comment:    comment,
	}); err != nil {
		l.Error("failed to insert experiment update log", err)
		metrics.LogErrors.WithLabelValues().Inc()
	}
}
