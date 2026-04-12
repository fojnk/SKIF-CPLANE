package dto

import (
	"encoding/json"
	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"time"
)

type Cluster string

const (
	Miranda   Cluster = "miranda"
	MercuryKC Cluster = "mercury-kc"
	MercuryRC Cluster = "mercury-rc"
	MercuryPC Cluster = "mercury-pc"
	MercuryHC Cluster = "mercury-hc"
	MercuryUC Cluster = "mercury-uc"
	Jupiter   Cluster = "jupiter"
	Moon      Cluster = "moon"
	Saturn    Cluster = "saturn"
)

type Dataset struct {
	ID        int32       `json:"id"`
	Name      string      `json:"name"`
	Type      string      `json:"type"`
	Params    string      `json:"params"`
	Schema    string      `json:"schema"`
	Public    bool        `json:"public"`
	Managed   bool        `json:"-"`
	VersionID int32       `json:"version_id"`
	ProjectID pgtype.Int4 `json:"-"`
	Alias     string      `json:"-"`
}

type DatasetShort struct {
	ID            int32              `json:"id"`
	Name          string             `json:"name"`
	Type          string             `json:"type"`
	Public        bool               `json:"public"`
	ProjectInfo   ProjectCatalogInfo `json:"project_info"`
	NamespaceInfo Namespace          `json:"namespace_info"`
}

type DatasetInfo struct {
	ID                   int32              `json:"id"`
	Name                 string             `json:"name"`
	Type                 string             `json:"type"`
	Public               bool               `json:"public"`
	ProjectInfo          ProjectCatalogInfo `json:"project_info"`
	NamespaceInfo        Namespace          `json:"namespace_info"`
	LinkedExperimentsCount int64              `json:"linked_experiments_count"`
	UpdatedAt            time.Time          `json:"updated_at"`
	CreatedAt            time.Time          `json:"created_at"`
	Rights               []acl.Right        `json:"rights"`
}

type DatasetWithProject struct {
	ID        int32       `json:"id"`
	Name      string      `json:"name"`
	Type      string      `json:"type"`
	Params    string      `json:"params"`
	Schema    string      `json:"schema"`
	Public    bool        `json:"public"`
	Managed   bool        `json:"-"`
	VersionID int32       `json:"version_id"`
	ProjectID pgtype.Int4 `json:"-"`
}

type DatasetExperimentLink struct {
	ExperimentID   int32  `json:"experiment_id"`
	ExperimentName string `json:"experiment_name"`
	AliasID      int32  `json:"alias_id"`
	Alias        string `json:"alias"`
	ProjectID    int32  `json:"project_id"`
	ProjectName  string `json:"project_name"`
}

func (d Dataset) MarshalJSON() ([]byte, error) {
	type Alias Dataset
	return json.Marshal(struct {
		Alias
		DatasetID   int32  `json:"dataset_id"`
		DatasetName string `json:"dataset_name"`
	}{
		Alias:       Alias(d),
		DatasetID:   d.ID,
		DatasetName: d.Name,
	})
}

func (d DatasetShort) MarshalJSON() ([]byte, error) {
	type Alias DatasetShort
	return json.Marshal(struct {
		Alias
		DatasetID   int32  `json:"dataset_id"`
		DatasetName string `json:"dataset_name"`
	}{
		Alias:       Alias(d),
		DatasetID:   d.ID,
		DatasetName: d.Name,
	})
}

func (d DatasetInfo) MarshalJSON() ([]byte, error) {
	type Alias DatasetInfo
	return json.Marshal(struct {
		Alias
		DatasetID              int32  `json:"dataset_id"`
		DatasetName            string `json:"dataset_name"`
		LinkedModelsCount      int64  `json:"linked_models_count"`
		LinkedExperimentsCount int64  `json:"linked_experiments_count"`
	}{
		Alias:                  Alias(d),
		DatasetID:              d.ID,
		DatasetName:            d.Name,
		LinkedModelsCount:      d.LinkedExperimentsCount,
		LinkedExperimentsCount: d.LinkedExperimentsCount,
	})
}

func (d DatasetWithProject) MarshalJSON() ([]byte, error) {
	type Alias DatasetWithProject
	return json.Marshal(struct {
		Alias
		DatasetID   int32  `json:"dataset_id"`
		DatasetName string `json:"dataset_name"`
	}{
		Alias:       Alias(d),
		DatasetID:   d.ID,
		DatasetName: d.Name,
	})
}

func (d DatasetExperimentLink) MarshalJSON() ([]byte, error) {
	type Alias DatasetExperimentLink
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
		ModelID        int32  `json:"model_id"`
		ModelName      string `json:"model_name"`
	}{
		Alias:          Alias(d),
		ExperimentID:   d.ExperimentID,
		ExperimentName: d.ExperimentName,
		ModelID:        d.ExperimentID,
		ModelName:      d.ExperimentName,
	})
}
