package private

import (
	dataset2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/dataset"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *ControlPlaneTestSuite) TestDatasetKafka() {
	// add namespace
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns4"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// PROJECT
	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-kafka"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	// add dataset kafka
	res, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-kafka-dataset"),
			Type:      "Kafka",
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-kafka-dataset", res.Payload.Name)
	s.Require().Equal("Kafka", res.Payload.Type)

	// add dataset kafka managed error
	_, err = s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-kafka-dataset"),
			Type:      "Kafka",
			ProjectID: &projRes.Payload.ID,
			Managed:   true,
		},
		Context: s.ctx,
	})
	s.Require().Error(err)

	// get dataset
	getRes, err := s.c.Dataset.GetAPIV2Dataset(&dataset2.GetAPIV2DatasetParams{
		DatasetID: res.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("test-kafka-dataset", getRes.Payload.Name)
	s.Require().Equal("Kafka", getRes.Payload.Type)

	// update dataset
	updateRes, err := s.c.Dataset.PutAPIV2Dataset(&dataset2.PutAPIV2DatasetParams{
		Request: &models2.RequestsUpdateDatasetRequestV2{
			ID:     ptr(res.Payload.ID),
			Name:   "updated-kafka-dataset",
			Schema: "{}",
			Params: `{"Kafka": {"BootstrapServers": "kafka1:9092,kafka2:9092", "SrcTopic": "updated-topic"}}`,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)
	s.Require().Equal("updated-kafka-dataset", updateRes.Payload.Dataset.Name)

	// update dataset kafka managed error
	_, err = s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-kafka-dataset"),
			Type:      "Kafka",
			Managed:   true,
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().Error(err)

	// delete dataset
	resDelete, err := s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDelete)
}
