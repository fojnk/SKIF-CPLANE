package public

import (
	"github.com/go-openapi/runtime/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	privateModels "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
	datasetClient "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/dataset"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/project"
	publicModels "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/models"
)

func (s *StreamflowTestSuite) TestPublicDatasetDuplicatePathForbidden() {
	nsRes, err := s.privateC.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &privateModels.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID, s.RobotID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &publicModels.RequestsCreateProjectRequest{
			Name:         ptr("test-project"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	params := `{
		"YT": {
			"Cluster": "miranda.yt.idzn.ru",
			"Path": "//home/adtech/adtech-profile/dup-test"
		},
		"SourceType": "ST_EXTERNAL_KEY_VALUE"
	}`

	firstDs, err := s.c.Dataset.PostAPIV2Dataset(&datasetClient.PostAPIV2DatasetParams{
		Request: &publicModels.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-dup-1"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
			Params:    params,
			Schema:    "{}",
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(firstDs)
	s.Require().NotNil(firstDs.Payload)

	_, err = s.c.Dataset.PostAPIV2Dataset(&datasetClient.PostAPIV2DatasetParams{
		Request: &publicModels.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-dup-2"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
			Params:    params,
			Schema:    "{}",
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))

	s.Require().Error(err)
	conflictErr, ok := err.(*datasetClient.PostAPIV2DatasetConflict)
	s.Require().True(ok, "expected PostAPIV2DatasetConflict, got: %T", err)
	s.Require().Equal(409, conflictErr.Code())
}
