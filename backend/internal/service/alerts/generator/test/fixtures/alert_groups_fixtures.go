package fixtures

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"

func GetOneAlertGroupWithoutRules() alerts.AlertGroup {
	return alerts.AlertGroup{
		AlertGroupId: 123,
		ProductId:    1213,
		Experiment: alerts.Experiment{
			ProjectName:  "testProject",
			ExperimentName: "testExperiment",
			ExperimentId:   177,
			ProjectId:    65,
			YTWorkDir:    "test/yt/workdir",
		},
		AlertRules: map[int32]alerts.AlertRule{},
	}
}

// Rule returns AlertRule for tests. ruleId and alertTemplateId задают правило,
// остальные параметры — limit, severity, delays, severityIsActive.
func Rule(ruleId, alertTemplateId int32, limit, severity, delayFiring, delayResolving string, severityIsActive bool) alerts.AlertRule {
	return alerts.AlertRule{
		RuleId:           ruleId,
		AlertTemplateId:  alertTemplateId,
		Limit:            limit,
		Severity:         severity,
		SeverityIsActive: severityIsActive,
		DelayFiring:      delayFiring,
		DelayResolving:   delayResolving,
	}
}

// GetAlertGroupWithRules возвращает базовую группу (как GetOneAlertGroupWithoutRules) с заданными правилами.
func GetAlertGroupWithRules(rules map[int32]alerts.AlertRule) alerts.AlertGroup {
	g := GetOneAlertGroupWithoutRules()
	g.AlertRules = rules
	return g
}

// allTestRules — полный словарь правил для тестов, соответствующий примерам в template_samples_fixture.
// Ключ — template_id (ид шаблона = rule_id в тестах).
func allTestRules() map[int32]alerts.AlertRule {
	return map[int32]alerts.AlertRule{
		1:   Rule(1, 1, "100k", "warning", "5m", "2m", true),   // row_lag, dzen
		2:   Rule(2, 2, "10m", "critical", "3m", "1m", true),  // time_lag, dzen
		3:   Rule(3, 3, "50k", "warning", "5m", "2m", true),   // resharder_consumed, dzen
		4:   Rule(4, 4, "50k", "warning", "5m", "2m", true),   // worker_consumed, dzen
		5:   Rule(5, 5, "100", "warning", "5m", "2m", true),  // resharder_epoch_ratio, infra
		6:   Rule(6, 6, "100", "warning", "5m", "2m", true),  // worker_epoch_ratio, infra
		7:   Rule(7, 7, "", "warning", "5m", "2m", true),      // resharder_row_count_is_empty_input, infra
		8:   Rule(8, 8, "", "warning", "5m", "2m", true),     // resharder_row_count_is_empty_output, infra
		9:   Rule(9, 9, "", "warning", "5m", "2m", true),     // resharder_row_count_in_out_is_mismatch, infra
		10:  Rule(10, 10, "", "warning", "5m", "2m", true),   // worker_row_count_is_empty, infra
		101: Rule(101, 101, "", "warning", "5m", "2m", true), // row_lag_absent, dzen
		102: Rule(102, 102, "", "info", "10m", "5m", true),   // time_lag_absent, dzen
		103: Rule(103, 103, "", "warning", "5m", "2m", true), // resharder_consumed_absent, dzen
		105: Rule(105, 105, "", "warning", "5m", "2m", true), // resharder_epoch_ratio_absent, infra
		106: Rule(106, 106, "", "warning", "5m", "2m", true), // worker_epoch_ratio_absent, infra
		107: Rule(107, 107, "", "warning", "5m", "2m", true), // resharder_row_count_is_empty_input_absent, infra
		108: Rule(108, 108, "", "warning", "5m", "2m", true), // resharder_row_count_is_empty_output_absent, infra
		109: Rule(109, 109, "", "warning", "5m", "2m", true), // worker_row_count_is_empty_absent, infra
	}
}

// GetRules возвращает только запрошенные по слайсу правила. keys — слайс template_id (или rule_id).
// Возвращается map[template_id]AlertRule.
func GetRules(keys []int32) map[int32]alerts.AlertRule {
	all := allTestRules()
	out := make(map[int32]alerts.AlertRule, len(keys))
	for _, id := range keys {
		if r, ok := all[id]; ok {
			out[id] = r
		}
	}
	return out
}
