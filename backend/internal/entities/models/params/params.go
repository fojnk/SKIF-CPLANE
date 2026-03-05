package params

import "fmt"

type Type string

const (
	String  Type = "string"
	Integer Type = "integer"
	Double  Type = "double"
	Boolean Type = "boolean"
	Array   Type = "array"
	KV      Type = "kv"
	Struct  Type = "struct"
	Custom  Type = "custom"
)

type StringType string

const (
	Text   StringType = "text"
	Json   StringType = "json"
	Python StringType = "python"
	YQL    StringType = "yql"
)

type TypeConstraint struct {
	// string
	Length     *uint32    `json:"length,omitempty"`
	Multiline  *bool      `json:"multiline,omitempty"`
	Enum       []string   `json:"enum,omitempty"`
	StringType StringType `json:"string_type,omitempty"`
	// int
	Gt *int64 `json:"gt,omitempty"`
	Lt *int64 `json:"lt,omitempty"`
}

type ParamType struct {
	Type           Type            `json:"type"`
	NestedType     Type            `json:"nested_type,omitempty"`
	TypeConstraint *TypeConstraint `json:"type_constraint,omitempty"`
	StructParams   *[]Param        `json:"struct_params,omitempty"`
}

func ValidateParamType(paramType ParamType) error {
	switch paramType.Type {
	case String:
		// no constraint check
	case Integer:
		// no constraint check
	case Double:
		// no constraint check
	case Boolean:
		// no constraint check
	case Array:
		fallthrough
	case KV:
		// nested type check
		if paramType.NestedType == "" {
			return fmt.Errorf("nested type is required for kv and array types")
		}
	case Struct:
		if paramType.StructParams == nil || len(*paramType.StructParams) == 0 {
			return fmt.Errorf("struct params are empty")
		}
	case Custom:
		// no constraint check
	default:
		return fmt.Errorf("unknown ParamType Type")
	}

	return nil
}

type Param struct {
	Name        string     `json:"name"`
	Type        *ParamType `json:"type,omitempty"`
	Default     any        `json:"default,omitempty"`
	Required    bool       `json:"required"`
	Description string     `json:"description"`
	OneOf       *[]Param   `json:"one_of,omitempty"`
}

func ValidateParams(params []Param) error {
	for _, param := range params {
		if len(param.Name) == 0 {
			return fmt.Errorf("name can't be empty")
		}

		if param.Type != nil {
			if err := ValidateParamType(*param.Type); err != nil {
				return fmt.Errorf("param \"%s\" type \"%s\" error: %s", param.Name, param.Type.Type, err.Error())
			}
		}

		if param.OneOf != nil {
			if err := ValidateParams(*param.OneOf); err != nil {
				return fmt.Errorf("param \"%s\" oneOf error: %s", param.Name, err.Error())
			}
		}
	}

	return nil
}
