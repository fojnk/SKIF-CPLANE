package models

import "gitlab.corp.mail.ru/ai/streamflow/backend/libs/models/experiment"

type SourceParams struct {
	SourceType            string                      `json:"SourceType"`
	ShardsCount           int                         `json:"ShardsCount"`
	YT                    *experiment.YTSourceConfig    `json:"YT" validate:"excluded_with=Kafka,required_without=Kafka"`
	Kafka                 *experiment.KafkaSourceConfig `json:"Kafka" validate:"excluded_with=YT,required_without=YT"`
	Attributes            any                         `json:"Attributes"`
	NormalizedQYTSchema   *bool                       `json:"NormalizedQYTSchema,omitempty"`
	NormalizedKafkaSchema *bool                       `json:"NormalizedKafkaSchema,omitempty"`
	MessageFormat         string                      `json:"MessageFormat"`
	ProtoInfo             *experiment.ProtoInfo         `json:"ProtoInfo,omitempty"`
}
