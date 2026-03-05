package models

type DataSchema struct {
	Columns []SchemaColumn `json:"columns" validate:"required"`
}

type SchemaColumn struct {
	ColumnName *string `json:"column_name,omitempty" validate:"required"`

	Type   *string       `json:"type,omitempty" validate:"omitnil,oneof=unknown boolean bool uint64 int64 uint32 int32 float double string utf8 json yson any uuid datetime timestamp uint16 int16 uint8 int8 date date32 datetime64 timestamp64 interval64 interval tz_date tz_datetime tz_timestamp tz_date32 tz_datetime64 tz_timestamp64 null void"`
	List   *SchemaColumn `json:"list,omitempty"`
	Struct *struct {
		Fields []SchemaColumn `json:"fields,omitempty"`
	} `json:"struct,omitempty"`
	Tuple *struct {
		Types []SchemaColumn `json:"types,omitempty"`
	} `json:"tuple,omitempty"`
	Dict *struct {
		Key   *SchemaColumn `json:"key,omitempty"`
		Value *SchemaColumn `json:"value,omitempty"`
	} `json:"dict,omitempty"`

	Optional    *bool   `json:"optional,omitempty"`
	Sorted      *bool   `json:"sorted,omitempty"`
	SortOrder   *bool   `json:"sort_order,omitempty" validate:"omitnil,oneof=none ascending descending"`
	DataGroup   *string `json:"data_group,omitempty"`
	LockGroup   *string `json:"lock_group,omitempty"`
	Expression  *string `json:"expression,omitempty"`
	Aggregation *string `json:"aggregation,omitempty" validate:"omitnil,oneof=none sum min max first xdelta dict_sum"`
	HunkSize    *uint64 `json:"hunk_size,omitempty"`
}
