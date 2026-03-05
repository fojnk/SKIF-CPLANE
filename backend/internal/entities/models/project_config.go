package models

import "gitlab.corp.mail.ru/ai/streamflow/backend/libs/models/experiment"

type ExperimentMeta struct {
	AbcProductId string                `json:"AbcProductId"`
	YT           experiment.MetaYTConfig `json:"YT"`
}
