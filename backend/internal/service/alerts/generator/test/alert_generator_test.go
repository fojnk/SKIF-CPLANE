package test

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/stretchr/testify/require"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/alerts/generator"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/alerts/generator/test/fixtures"
)

func getTestTemplateDir() string {
	if d := os.Getenv("TEMPLATES_DIR"); d != "" {
		return d
	}
	_, file, _, _ := runtime.Caller(0)
	dir := filepath.Dir(file)
	root := filepath.Join(dir, "..", "..", "..", "..", "..")
	return filepath.Join(root, "templates")
}

func TestNewAlertGenerator(t *testing.T) {
	alertGenerator := generator.NewAlertGenerator(getTestTemplateDir())
	limits, err := alertGenerator.GetAlertTypeLimits()
	require.NoError(t, err)
	require.Equal(t, fixtures.GetExpectedTypeLimits(), limits)

	templates, err := alertGenerator.GetAlertTemplates()
	require.NoError(t, err)
	require.Equal(t, fixtures.GetExpectedTemplates(), templates)
}

func TestGetAlertGroupInfo(t *testing.T) {
	alertGenerator := generator.NewAlertGenerator(getTestTemplateDir())
	templates, err := alertGenerator.GetAlertTemplates()
	require.NoError(t, err)
	tests := []struct {
		testName string
		rules    []int32
	}{
		{
			testName: "dzen_test1",
			rules:    []int32{1},
		},
		{
			testName: "dzen_test2",
			rules:    []int32{2},
		},
		{
			testName: "dzen_test3",
			rules:    []int32{3},
		},
		{
			testName: "dzen_test4",
			rules:    []int32{4},
		},
		{
			testName: "infra_test5",
			rules:    []int32{5},
		},
		{
			testName: "infra_test6",
			rules:    []int32{6},
		},
		{
			testName: "infra_test7",
			rules:    []int32{7},
		},
		{
			testName: "infra_test8",
			rules:    []int32{8},
		},
		{
			testName: "infra_test9",
			rules:    []int32{9},
		},
		{
			testName: "infra_test10",
			rules:    []int32{10},
		},
		{
			testName: "dzen_test11",
			rules:    []int32{101},
		},
		{
			testName: "dzen_test12",
			rules:    []int32{102},
		},
		{
			testName: "dzen_test13",
			rules:    []int32{103},
		},
		{
			testName: "infra_test14",
			rules:    []int32{105},
		},
		{
			testName: "infra_test15",
			rules:    []int32{106},
		},
		{
			testName: "infra_test16",
			rules:    []int32{107},
		},
		{
			testName: "infra_test17",
			rules:    []int32{108},
		},
		{
			testName: "infra_test18",
			rules:    []int32{109},
		},
		{
			testName: "dzen_test19",
			rules:    []int32{1, 2},
		},
		{
			testName: "dzen_test20",
			rules:    []int32{2, 1},
		},
		{
			testName: "dzen_test21",
			rules:    []int32{1, 3},
		},
		{
			testName: "dzen_test22",
			rules:    []int32{1, 4},
		},
		{
			testName: "dzen_test23",
			rules:    []int32{1, 101},
		},
		{
			testName: "dzen_test24",
			rules:    []int32{1, 102},
		},
		{
			testName: "dzen_test25",
			rules:    []int32{1, 103},
		},
		{
			testName: "infra_test26",
			rules:    []int32{5, 6},
		},
		{
			testName: "infra_test27",
			rules:    []int32{6, 5},
		},
		{
			testName: "infra_test28",
			rules:    []int32{5, 7},
		},
		{
			testName: "infra_test29",
			rules:    []int32{5, 8},
		},
		{
			testName: "infra_test30",
			rules:    []int32{5, 9},
		},
		{
			testName: "infra_test31",
			rules:    []int32{5, 10},
		},
		{
			testName: "infra_test32",
			rules:    []int32{5, 105},
		},
		{
			testName: "infra_test33",
			rules:    []int32{5, 106},
		},
		{
			testName: "infra_test34",
			rules:    []int32{5, 107},
		},
		{
			testName: "infra_test35",
			rules:    []int32{5, 108},
		},
		{
			testName: "infra_test36",
			rules:    []int32{5, 109},
		},
	}
	for _, test := range tests {
		t.Run(test.testName, func(t *testing.T) {
			rules := fixtures.GetRules(test.rules)
			transformedRules := make(map[int32]alerts.AlertRule, len(rules))
			for _, rule := range rules {
				err = alertGenerator.ValidateRule(rule)
				require.NoError(t, err)
				transformedRule, err := alertGenerator.TransformRule(rule)
				require.NoError(t, err)
				transformedRules[rule.RuleId] = transformedRule
			}
			alertGroup := fixtures.GetAlertGroupWithRules(transformedRules)
			namespace := "dzen"
			if templates[test.rules[0]].Namespace == "infra" {
				namespace = "infra"
			}
			content, err := alertGenerator.GetAlertGroupInfo(alertGroup, namespace)
			require.NoError(t, err)
			require.Equal(t, fixtures.PrepareSampleData(test.rules, namespace), content.Body)
		})
	}
}

func TestGenerateAlertFileName(t *testing.T) {
	group := fixtures.GetOneAlertGroupWithoutRules()
	tests := []struct {
		namespace string
		expected  string
	}{
		{"dzen", "177_65_group_No123_dzen_1213.yaml"},
		{"infra", "177_65_group_No123_infra_1213.yaml"},
		{"namespace", "177_65_group_No123_namespace_1213.yaml"},
	}
	for _, test := range tests {
		fileName := generator.GenerateAlertFileName(group, test.namespace)
		require.Equal(t, test.expected, fileName)
	}
}
