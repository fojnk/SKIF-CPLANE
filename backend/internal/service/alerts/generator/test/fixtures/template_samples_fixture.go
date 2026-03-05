package fixtures

import (
	// "sort"
	"sort"
	"strings"
)

func PrepareSampleData(keys []int32, namespace string) string {
  rules := allExpectedTemplateBodies()
	bodyBuilder := strings.Builder{}
	bodyBuilder.WriteString(GetExpectedHeader(namespace))
  sort.Slice(keys, func(i, j int) bool {
		return keys[i] < keys[j]
	})
	for _, key := range keys {
		rule := rules[key]
		bodyBuilder.WriteString(rule)
	}
	return bodyBuilder.String()
}

func GetExpectedHeader(namespace string) string {
	return `groups:
  - name: "testProject/testExperiment StreamFlow alert group No123 namespace:` + namespace + ` product_id:1213"
    namespace: ` + namespace + `
    rules:
      - record: 65:177:123:` + namespace + `:common_labels
        expr: vector(1)
        labels: &common_labels
          product_id: 1213
`
}

// allExpectedTemplateBodies — полный словарь готовых тел всех шаблонов после подстановки
// стандартных тестовых данных. Ключ — template_id.
func allExpectedTemplateBodies() map[int32]string {
	return map[int32]string{
		1: `      - alert: "[testProject] testExperiment row lags"
        expr: | 
          max(yt_queue_agent_consumer_partition_lag_rows_sum{
            consumer_path=~"test/yt/workdir/consumers/.*",
            partition_index=""
          }) > 100000
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Превышен порог в 100000 строк допустимого лага очереди.

            Текущее значение: {{ printf "%.2f" $value }} строк.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment лаг в очереди более 100000 строк.
`,
		2: `      - alert: "[testProject] testExperiment time lags"
        expr: |
          max(yt_queue_agent_consumer_partition_lag_time_max{
            consumer_path=~"test/yt/workdir/consumers/.*",
            partition_index=""
          }) > 600
        for: 180
        keep_firing_for: 60
        labels:
          <<: *common_labels
          severity: Critical
        annotations:
          description: |
            Превышен порог в 600 секунд допустимого лага очереди.

            Текущее значение: {{ printf "%.2f" $value }} сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment лаг в очереди более 600 секунд.
`,
		3: `      - alert: "[testProject] testExperiment resharder consumed"
        expr: |
          min(rate(yt_queue_agent_consumer_partition_rows_consumed{
            consumer_cluster="miranda",
            consumer_path=~"test/yt/workdir/consumers/resharder",
            partition_index=""
          }[5m])) < 50000
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Потребление сообщений решардером ниже порога 50000 сообщений/сек.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment потребление сообщений решардером ниже 50000 сообщений/сек.
`,
		4: `      - alert: "[testProject] testExperiment worker consumed"
        expr: |
          min(rate(yt_queue_agent_consumer_partition_rows_consumed{
            consumer_cluster="miranda",
            consumer_path=~"test/yt/workdir/consumers/worker",
            partition_index=""
          }[5m])) < 50000
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Потребление сообщений воркером ниже порога 50000 сообщений/сек.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment потребление сообщений воркером ниже 50000 сообщений/сек.
`,
		5: `      - alert: "[testProject] testExperiment resharder epoch ratio"
        expr: |
          min(
            sum(rate(rtse_epochs_failed{sf_experiment_id="177", instance=~".*rsdr.*"}[5m]) or 0) / 
            sum(rate(rtse_epochs_total{sf_experiment_id="177", instance=~".*rsdr.*"} [5m]) or 1),
            1
          ) > 100
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Превышен порог в 100 допустимого соотношения неудачных эпох решардера.

            Текущее значение: {{ printf "%.4f" $value }}

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment соотношение неудачных эпох решардера более 100.
`,
		6: `      - alert: "[testProject] testExperiment worker epoch ratio"
        expr: |
          min(
            sum(rate(rtse_epochs_failed{sf_experiment_id="177", instance=~".*wrkr.*"}[5m]) or 0) / 
            sum(rate(rtse_epochs_total{sf_experiment_id="177", instance=~".*wrkr.*"}[5m]) or 1),
            1
          ) > 100
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Превышен порог в 100 допустимого соотношения неудачных эпох воркера.

            Текущее значение: {{ printf "%.4f" $value }}

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment соотношение неудачных эпох воркера более 100.
`,
		7: `      - alert: "[testProject] testExperiment resharder row count is empty input"
        expr: |
          max(sum by(stream) (
            min by (cloud_dc, cloud_instance, stream) (
              rate(rtse_messages_count_input{sf_experiment_id="177", instance=~".*rsdr.*"}[1m])
            )
          )) < 0.001
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Количество входящих сообщений в resharder меньше 0.001.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment resharder не получает входящие сообщения.
`,
		8: `      - alert: "[testProject] testExperiment resharder row count is empty output"
        expr: |
          max(sum by(stream) (
            min by (cloud_dc, cloud_instance, stream) (
              rate(rtse_messages_count_output{sf_experiment_id="177", instance=~".*rsdr.*"}[1m])
            )
          )) < 0.001
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Количество исходящих сообщений из resharder меньше 0.001.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment resharder не отправляет исходящие сообщения.
`,
		9: `      - alert: "[testProject] testExperiment resharder row count in/out is mismatch"
        expr: |
          max(abs(
            sum by(stream) (
              min by (cloud_dc, cloud_instance, stream) (
                rate(rtse_messages_count_input{sf_experiment_id="177", instance=~".*rsdr.*"}[1m])
              )
            ) - 
            sum by(stream) (
              min by (cloud_dc, cloud_instance, stream) (
                rate(rtse_messages_count_output{sf_experiment_id="177", instance=~".*rsdr.*"}[1m])
              )
            )
          )) > 0.1
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Несоответствие между входящими и исходящими сообщениями в resharderе.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment resharder теряет или дублирует сообщения.
`,
		10: `      - alert: "[testProject] testExperiment worker row count is empty"
        expr: |
          max(sum(
            min by (cloud_dc, cloud_instance, queue) (
              rate(rtse_processed_messages{sf_experiment_id="177", instance=~".*wrkr.*"}[1m])
            )
          )) < 0.001
        for: 300
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Количество обработанных сообщений worker'ами меньше 0.001 в секунду.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment worker'ы не обрабатывают сообщения.
`,
		101: `      - alert: "[testProject] testExperiment row lags absent"
        expr: |
          absent_over_time(yt_queue_agent_consumer_partition_lag_rows_sum{
            consumer_path=~"test/yt/workdir/consumers/.*",
            partition_index=""
          }[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Метрика лага по строкам отсутствует в течение 300 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрика лага по строкам отсутствует 300.
`,
		102: `      - alert: "[testProject] testExperiment time lags absent"
        expr: |
          absent_over_time(yt_queue_agent_consumer_partition_lag_time_max{
            consumer_path=~"test/yt/workdir/consumers/.*",
            partition_index=""
          }[600])
        keep_firing_for: 300
        labels:
          <<: *common_labels
          severity: Info
        annotations:
          description: |
            Метрика лага по времени отсутствует в течение 600 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрика лага по времени отсутствует 600.
`,
		103: `      - alert: "[testProject] testExperiment resharder consumed absent"
        expr: |
          absent_over_time(yt_queue_agent_consumer_partition_rows_consumed{
            consumer_cluster="miranda",
            consumer_path=~"test/yt/workdir/consumers/resharder",
            partition_index=""
          }[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Потребление сообщений решардером отсутствует в течение 300 секунд.

            Текущее значение: {{ printf "%.4f" $value }} сообщений/сек.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment потребление сообщений решардером отсутствует в течение 300.
`,
		105: `      - alert: "[testProject] testExperiment resharder epoch ratio absent"
        expr: |
          absent_over_time(rtse_epochs_total{sf_experiment_id="177", instance=~".*rsdr.*"}[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Метрики эпох решардера отсутствуют в течение 300 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрики эпох решардера отсутствуют 300.
`,
		107: `      - alert: "[testProject] testExperiment resharder row count is empty input absent"
        expr: |
          absent_over_time(rtse_messages_count_input{sf_experiment_id="177", instance=~".*rsdr.*"}[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Метрика количества входящих сообщений в resharder отсутствует 300 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрика входящих сообщений resharder отсутствует 300.
`,
		108: `      - alert: "[testProject] testExperiment resharder row count is empty output absent"
        expr: |
          absent_over_time(rtse_messages_count_output{sf_experiment_id="177", instance=~".*rsdr.*"}[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Метрика количества исходящих сообщений resharder отсутствует 300 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрика исходящих сообщений resharder отсутствует 300.
`,
		106: `      - alert: "[testProject] testExperiment worker epoch ratio absent"
        expr: |
          absent_over_time(rtse_epochs_total{sf_experiment_id="177", instance=~".*wrkr.*"}[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Метрики эпох воркера отсутствуют в течение 300 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрики эпох воркера отсутствуют 300.
`,
		109: `      - alert: "[testProject] testExperiment worker row count is empty absent"
        expr: |
          absent_over_time(rtse_processed_messages{sf_experiment_id="177", instance=~".*wrkr.*"}[300])
        keep_firing_for: 120
        labels:
          <<: *common_labels
          severity: Warning
        annotations:
          description: |
            Метрика обработанных сообщений worker'ов отсутствует 300 секунд.

            ссылка на пайплайн: https://streamflow.vk.team/project?id=65&selected=pipe-177&p-tab=config
          summary: У проекта testProject в пайплайне testExperiment метрика обработанных сообщений worker'ов отсутствует 300.
`,
	}
}
