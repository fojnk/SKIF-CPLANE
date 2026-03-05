package validation

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSchemaValidation(t *testing.T) {
	type args struct {
		schemaConfig string
	}

	tests := []struct {
		name string
		args
		wantErr bool
	}{
		{
			name:    "TestSchemaV1ReturnError",
			wantErr: true,
			args: args{
				schemaConfig: `{"columns":[{"name":"test","type_v3":"{type_name=required;item=int64;}"}]}`,
			},
		},
		{
			name:    "TestSchemaV1NoColumnsReturnError",
			wantErr: true,
			args: args{
				schemaConfig: `{"name":"test","type_v3":"{type_name=required;item=int64;}"}`,
			},
		},
		{
			name:    "TestSchemaV2WrongTypeReturnError",
			wantErr: true,
			args: args{
				schemaConfig: `{"columns":[{"name":"test","type":"wrong_type"}]}`,
			},
		},
		{
			name:    "TestSchemaV2WrongColumnNameReturnError",
			wantErr: true,
			args: args{
				schemaConfig: `{"columns":[{"name":"test","type":"wrong_type"}]}`,
			},
		},
		{
			name:    "TestSchemaV2ValidReturnNoError",
			wantErr: false,
			args: args{
				schemaConfig: `{"columns":[{"column_name":"test","type":"string"}]}`,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := DatasetDataSchemaValidation(tt.args.schemaConfig)
			if !tt.wantErr {
				require.NoError(t, err)
			} else {
				require.Error(t, err)
			}
		})
	}
}
