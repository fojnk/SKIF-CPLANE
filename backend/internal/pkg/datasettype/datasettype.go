package datasettype

const (
	JSON  = "json"
	Kafka = "kafka"
)

// IsAllowedOnCreate returns true for types that may be used when creating a new dataset.
func IsAllowedOnCreate(t string) bool {
	return t == JSON || t == Kafka
}

func IsKafka(t string) bool {
	return t == Kafka || t == "Kafka"
}

// UsesYTDeduplication covers json and legacy YT-backed dataset types.
func UsesYTDeduplication(t string) bool {
	switch t {
	case JSON, "Queue", "KeyValue", "StaticTableDir":
		return true
	default:
		return false
	}
}
