package service

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
)

// ACL aliases expose access control primitives to the controller layer without
// coupling it to the pkg implementation.
type ACLAction = acl.Action
type ACLObjectType = acl.ObjectType
type ACLObjectAttribute = acl.ObjectAttribute
type ACLRight = acl.Right

const (
	ACLActionRead   ACLAction = acl.Read
	ACLActionEdit   ACLAction = acl.Edit
	ACLActionCreate ACLAction = acl.Create
	ACLActionDelete ACLAction = acl.Delete
)

const (
	ACLObjectNamespace  ACLObjectType = acl.Namespace
	ACLObjectExperiment   ACLObjectType = acl.Experiment
	ACLObjectDataset ACLObjectType = acl.Dataset
	ACLObjectProject    ACLObjectType = acl.Project
	ACLObjectRoot       ACLObjectType = acl.Root
	ACLObjectRule       ACLObjectType = acl.Rule
	ACLObjectRole       ACLObjectType = acl.Role
	ACLObjectUser       ACLObjectType = acl.User
	ACLObjectUserGroup  ACLObjectType = acl.UserGroup
)

const (
	ACLAttributeMeta               ACLObjectAttribute = acl.MetaAttribute
	ACLAttributeConfig             ACLObjectAttribute = acl.ConfigAttribute
	ACLAttributeName               ACLObjectAttribute = acl.NameAttribute
	ACLAttributeAlias              ACLObjectAttribute = acl.AliasAttribute
	ACLAttributeSchema             ACLObjectAttribute = acl.SchemaAttribute
	ACLAttributeProject            ACLObjectAttribute = acl.ProjectAttribute
	ACLAttributeNamespace          ACLObjectAttribute = acl.NamespaceAttribute
	ACLAttributeExperiment           ACLObjectAttribute = acl.ExperimentAttribute
	ACLAttributeDataset         ACLObjectAttribute = acl.DatasetAttribute
	ACLAttributeNone               ACLObjectAttribute = acl.NoAttribute
	ACLAttributeExperimentState      ACLObjectAttribute = acl.ExperimentStateAttribute
	ACLAttributeExperimentStateStop  ACLObjectAttribute = acl.ExperimentStateStopAttribute
	ACLAttributeExperimentStateStart ACLObjectAttribute = acl.ExperimentStateStartAttribute
	ACLAttributeExperimentStateApply ACLObjectAttribute = acl.ExperimentStateApplyAttribute
)

const (
	ACLRightEditConfig ACLRight = acl.RightEditConfig
	ACLRightEditName   ACLRight = acl.RightEditName
	ACLRightEditSchema ACLRight = acl.RightEditSchema

	ACLRightCreateProject    ACLRight = acl.RightCreateProject
	ACLRightCreateDataset ACLRight = acl.RightCreateDataset
	ACLRightCreateExperiment   ACLRight = acl.RightCreateExperiment
	ACLRightCreateNamespace  ACLRight = acl.RightCreateNamespace

	ACLRightDeleteExperiment   ACLRight = acl.RightDeleteExperiment
	ACLRightDeleteDataset ACLRight = acl.RightDeleteDataset
	ACLRightDeleteProject    ACLRight = acl.RightDeleteProject
	ACLRightDeleteNamespace  ACLRight = acl.RightDeleteNamespace

	ACLRightStartExperiment ACLRight = acl.RightStartExperiment
	ACLRightStopExperiment  ACLRight = acl.RightStopExperiment
	ACLRightApplyExperiment ACLRight = acl.RightApplyExperiment

	ACLRightCreateVariable ACLRight = acl.RightCreateVariable
	ACLRightEditVariable   ACLRight = acl.RightEditVariable
	ACLRightDeleteVariable ACLRight = acl.RightDeleteVariable
)

// Update log aliases expose logging actions and payload structures.
type UpdateLogAction = update_log.Action
type ExperimentUpdateLog = update_log.ExperimentUpdateLog
type ExperimentUpdateLogEntity = update_log.Experiment
type ProjectUpdateLog = update_log.ProjectUpdateLog
type ProjectUpdateLogEntity = update_log.Project
type NamespaceUpdateLog = update_log.NamespaceUpdateLog
type NamespaceUpdateLogEntity = update_log.Namespace
type DatasetUpdateLog = update_log.DatasetUpdateLog
type DatasetUpdateLogEntity = update_log.Dataset

const (
	UpdateLogActionNew                  UpdateLogAction = update_log.ActionNew
	UpdateLogActionUpdate               UpdateLogAction = update_log.ActionUpdate
	UpdateLogActionDelete               UpdateLogAction = update_log.ActionDelete
	UpdateLogActionStartExperiment        UpdateLogAction = update_log.ActionStartExperiment
	UpdateLogActionStopExperiment         UpdateLogAction = update_log.ActionStopExperiment
	UpdateLogActionApplyExperiment        UpdateLogAction = update_log.ActionApplyExperiment
	UpdateLogActionDatasetAdd        UpdateLogAction = update_log.ActionDatasetAdd
	UpdateLogActionDatasetDelete     UpdateLogAction = update_log.ActionDatasetDelete
	UpdateLogActionNewDatasetLink    UpdateLogAction = update_log.ActionNewDatasetLink
	UpdateLogActionDeleteDatasetLink UpdateLogAction = update_log.ActionDeleteDatasetLink
	UpdateLogActionUpdateDatasetLink UpdateLogAction = update_log.ActionUpdateDatasetLink
	UpdateLogActionNewVariable          UpdateLogAction = update_log.ActionNewVariable
	UpdateLogActionUpdateVariable       UpdateLogAction = update_log.ActionUpdateVariable
	UpdateLogActionDeleteVariable       UpdateLogAction = update_log.ActionDeleteVariable
)

// Orchestrator aliases expose shared enumerations to controllers.
type ExperimentVariableType = orch.ExperimentVariableType

const (
	ExperimentVariableTypeString ExperimentVariableType = orch.ExperimentVariableTypeString
	ExperimentVariableTypeInt    ExperimentVariableType = orch.ExperimentVariableTypeInt
	ExperimentVariableTypeJSON   ExperimentVariableType = orch.ExperimentVariableTypeJSON
	ExperimentVariableTypeYQL    ExperimentVariableType = orch.ExperimentVariableTypeYQL
	ExperimentVariableTypePython ExperimentVariableType = orch.ExperimentVariableTypePython
)
