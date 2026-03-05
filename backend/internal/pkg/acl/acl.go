package acl

//                                    ┌─────┐
//                                    │  :  │
//                                    └─────┘
//                                       │
//                               ┌───────┴────────┐
//                          ┌────▼────┐       ┌───▼──┐
//                          │namespace│       │ role │
//                          └─────────┘       └──────┘
//                               │
//                        ┌──────┼──────┐
//                        │      │      │
//                      ┌─▼─┐  ┌─▼─┐  ┌─▼─┐
//                      │ 5 │  │ 6 │  │ 7 │
//                      └───┘  └───┘  └───┘
//                        │             │
//              ┌─────────┴─────┐       └────────┐
//              │               │                │
//          ┌───▼──┐        ┌───▼───┐      ┌─────▼────┐
//          │ meta │        │project│      │dataset│
//          └──────┘        └───────┘      └──────────┘
//              │               │                │
//      ┌───────┴┐       ┌──────┼──────┐         │
//      │        │       │      │      │         │
//  ┌───▼──┐ ┌───▼──┐  ┌─▼─┐  ┌─▼─┐  ┌─▼─┐     ┌─▼─┐
//  │config│ │ name │  │ 1 │  │ 2 │  │ 4 │     │ 4 │
//  └──────┘ └──────┘  └───┘  └───┘  └───┘     └───┘
//                              │
//                      ┌───────┴───┐
//                 ┌────▼─────┐ ┌───▼────┐
//                 │dataset│ │experiment│
//                 └──────────┘ └────────┘
//                       │           │
//                ┌──────┘           │
//            ┌───▼──┐             ┌─▼─┐
//            │ meta │             │ 3 │
//            └──────┘             └───┘
//                │                  │
//                │                  │
//                │              ┌───▼──┐
//             ┌──▼──┐           │ meta │
//             │alias│           └──────┘
//             └─────┘               │
//                           ┌───────┴┐
//                           │        │
//                       ┌───▼──┐ ┌───▼──┐
//                       │config│ │ name │
//                       └──────┘ └──────┘

type Action string

const (
	Read   Action = "00R"
	Edit   Action = "01E"
	Create Action = "02C"
	Delete Action = "03D"
)

type ObjectType string

const (
	Namespace  ObjectType = "namespace"
	Experiment   ObjectType = "experiment"
	Dataset ObjectType = "dataset"
	Project    ObjectType = "project"
	Root       ObjectType = "root"
	Cube       ObjectType = "cube"

	Rule      ObjectType = "rule"
	Role      ObjectType = "role"
	User      ObjectType = "user"
	UserGroup ObjectType = "user_group"
)

type ObjectAttribute string

const (
	MetaAttribute   ObjectAttribute = "meta"
	ConfigAttribute ObjectAttribute = "meta:config"
	NameAttribute   ObjectAttribute = "meta:name"
	AliasAttribute  ObjectAttribute = "meta:alias"
	SchemaAttribute ObjectAttribute = "meta:schema"

	ProjectAttribute    ObjectAttribute = "project"
	NamespaceAttribute  ObjectAttribute = "namespace"
	ExperimentAttribute   ObjectAttribute = "experiment"
	DatasetAttribute ObjectAttribute = "dataset"
	CubeAttribute       ObjectAttribute = "cube"

	NoAttribute ObjectAttribute = ""

	ExperimentStateAttribute      ObjectAttribute = "experiment_state"
	ExperimentStateStopAttribute  ObjectAttribute = "experiment_state:stop"
	ExperimentStateStartAttribute ObjectAttribute = "experiment_state:start"
	ExperimentStateApplyAttribute ObjectAttribute = "experiment_state:apply"
)

type Right string

const (
	RightEditConfig Right = "edit_config"
	RightEditName   Right = "edit_name"
	RightEditSchema Right = "edit_schema"

	RightCreateProject    Right = "create_project"
	RightCreateDataset Right = "create_dataset"
	RightCreateExperiment   Right = "create_experiment"
	RightCreateNamespace  Right = "create_namespace"

	RightDeleteExperiment   Right = "delete_experiment"
	RightDeleteDataset Right = "delete_dataset"
	RightDeleteProject    Right = "delete_project"
	RightDeleteNamespace  Right = "delete_namespace"

	RightStartExperiment Right = "start_experiment"
	RightStopExperiment  Right = "stop_experiment"
	RightApplyExperiment Right = "apply_experiment"

	RightCreateVariable Right = "create_variable"
	RightEditVariable   Right = "edit_variable"
	RightDeleteVariable Right = "delete_variable"
)
