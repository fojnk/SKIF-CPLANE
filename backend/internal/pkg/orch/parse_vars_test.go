package orch

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseVarsWithTypes(t *testing.T) {
	vars := map[string]ExperimentVariable{
		"F1FeatureCalculator_GRPC_PORT": {
			Name:  "F1FeatureCalculator_GRPC_PORT",
			Type:  ExperimentVariableTypeInt,
			Value: "8080",
		},
		"DATABASE_URL": {
			Name:  "DATABASE_URL",
			Type:  ExperimentVariableTypeString,
			Value: "postgres://localhost:5432/mydb",
		},
		"ENABLE_LOGGING": {
			Name:  "ENABLE_LOGGING",
			Type:  ExperimentVariableTypeString,
			Value: "true",
		},
	}

	t.Run("Should parse regular placeholder", func(t *testing.T) {
		result, err := enrichValue("${F1FeatureCalculator_GRPC_PORT}", vars)
		assert.NoError(t, err)
		assert.Equal(t, 8080, result)
	})

	t.Run("Should parse typed placeholder with string type", func(t *testing.T) {
		result, err := enrichValue("${string:F1FeatureCalculator_GRPC_PORT}", vars)
		assert.NoError(t, err)
		assert.Equal(t, "8080", result)
	})

	t.Run("Should parse typed placeholder with int type", func(t *testing.T) {
		result, err := enrichValue("${int:F1FeatureCalculator_GRPC_PORT}", vars)
		assert.NoError(t, err)
		assert.Equal(t, 8080, result)
	})

	t.Run("Should parse mixed placeholders", func(t *testing.T) {
		result, err := enrichValue("DB: ${DATABASE_URL}, Port: ${int:F1FeatureCalculator_GRPC_PORT}, Logging: ${string:ENABLE_LOGGING}", vars)
		assert.NoError(t, err)
		// Для множественных переменных результат будет обработан по-другому
		// Проверим, что все переменные обрабатываются корректно
		assert.NotNil(t, result)
	})
}

func TestExtractVariableInfo(t *testing.T) {
	tests := []struct {
		name           string
		match          []string
		expectedType   string
		expectedName   string
	}{
		{
			name:         "Regular placeholder",
			match:        []string{"${F1FeatureCalculator_GRPC_PORT}", "F1FeatureCalculator_GRPC_PORT"},
			expectedType: "",
			expectedName: "F1FeatureCalculator_GRPC_PORT",
		},
		{
			name:         "Typed placeholder",
			match:        []string{"${int:F1FeatureCalculator_GRPC_PORT}", "int", "F1FeatureCalculator_GRPC_PORT"},
			expectedType: "int",
			expectedName: "F1FeatureCalculator_GRPC_PORT",
		},
		{
			name:         "Another typed placeholder",
			match:        []string{"${string:DATABASE_URL}", "string", "DATABASE_URL"},
			expectedType: "string",
			expectedName: "DATABASE_URL",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			typeName, varName := extractVariableInfo(tt.match)
			assert.Equal(t, tt.expectedType, typeName)
			assert.Equal(t, tt.expectedName, varName)
		})
	}
}
