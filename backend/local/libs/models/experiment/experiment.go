package experiment

type YTClusterConfig struct {
	ClusterUrl       string `json:"ClusterUrl"`
	TabletCellBundle string `json:"TabletCellBundle"`
}

type MetaYTConfig struct {
	Token            string            `json:"Token"`
	WorkDir          string            `json:"WorkDir"`
	Cluster          string            `json:"Cluster"`
	ProxyRole        string            `json:"ProxyRole"`
	TabletCellBundle string            `json:"TabletCellBundle"`
	MainCluster      *YTClusterConfig  `json:"MainCluster,omitempty"`
	ReplicaClusters  []YTClusterConfig `json:"ReplicaClusters,omitempty"`
}

type ExperimentMeta struct {
	ExperimentId   string       `json:"ExperimentId"`
	ProjectId    string       `json:"ProjectId"`
	Namespace    string       `json:"Namespace"`
	AbcProductId string       `json:"AbcProductId"`
	YT           MetaYTConfig `json:"YT"`
}

type ExperimentPlacement struct {
	OnecloudDatacenters []string `json:"OnecloudDatacenters"`
}

type ResourceConfig struct {
	ReplicasInDc   int `json:"ReplicasInDc"`
	CpuCores       int `json:"CpuCores"`
	RamMB          int `json:"RamMB"`
	NetworkInMbit  int `json:"NetworkInMbit"`
	NetworkOutMbit int `json:"NetworkOutMbit"`
}

type ExperimentResources struct {
	Worker    ResourceConfig `json:"Worker"`
	Resharder ResourceConfig `json:"Resharder"`
}

type PublicSource struct {
	Attributes any `json:"Attributes"`
}

type YTSourceConfig struct {
	Path             string `json:"Path"`
	Cluster          string `json:"Cluster"`
	Token            string `json:"Token"`
	ProxyRole        string `json:"ProxyRole"`
	TabletCellBundle string `json:"TabletCellBundle"`
}

type KafkaSourceConfig struct {
	Topic            string `json:"Topic"`
	BootstrapServers string `json:"BootstrapServers"`
	SrcTopic         string `json:"SrcTopic"`
}

type ProtoInfo struct {
	FileName    string `json:"FileName"`
	MessageName string `json:"MessageName"`
}

type ExperimentConfig struct {
	Meta            ExperimentMeta            `json:"Meta"`
	Placement       ExperimentPlacement       `json:"Placement"`
	Resources       ExperimentResources       `json:"Resources"`
	PublicSources   map[string]PublicSource `json:"PublicSources"`
	Resharder       map[string]any          `json:"Resharder"`
	Worker          map[string]any          `json:"Worker"`
	States          []any                   `json:"States"`
	InternalSources map[string]any          `json:"InternalSources"`
}
