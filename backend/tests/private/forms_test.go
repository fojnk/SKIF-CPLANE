package private

import (
	"reflect"
	"slices"

	form2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/form"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestGetFormDataset() {
	formDataQueue, err := s.c.Form.GetAPIV2FormsDataset(&form2.GetAPIV2FormsDatasetParams{
		Type:    "Queue",
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(formDataQueue)
	s.Require().NotEmpty(formDataQueue.Payload.Params)

	formDataKafka, err := s.c.Form.GetAPIV2FormsDataset(&form2.GetAPIV2FormsDatasetParams{
		Type:    "Kafka",
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(formDataKafka)
	s.Require().NotEmpty(formDataKafka.Payload.Params)
	// check that for queue returnin another form data
	s.Require().False(reflect.DeepEqual(formDataKafka.Payload.Params, formDataQueue.Payload.Params))

	formData, err := s.c.Form.GetAPIV2FormsDataset(&form2.GetAPIV2FormsDatasetParams{
		Type:    "KeyValue",
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(formData)
	s.Require().NotEmpty(formData.Payload.Params)
	// check that for queue returnin another form data
	s.Require().False(reflect.DeepEqual(formData.Payload.Params, formDataQueue.Payload.Params))
	s.Require().False(reflect.DeepEqual(formData.Payload.Params, formDataKafka.Payload.Params))
}

func (s *StreamflowTestSuite) TestGetFormProject() {
	formData, err := s.c.Form.GetAPIV2FormsProject(&form2.GetAPIV2FormsProjectParams{})

	s.Require().NoError(err)
	s.Require().NotNil(formData)
	s.Require().NotEmpty(formData.Payload.Params)
}

func (s *StreamflowTestSuite) TestGetFormExperiment() {
	formData, err := s.c.Form.GetAPIV2FormsExperiment(&form2.GetAPIV2FormsExperimentParams{})

	s.Require().NoError(err)
	s.Require().NotNil(formData)
	s.Require().NotEmpty(formData.Payload.Params)

	s.Require().True(slices.ContainsFunc(formData.Payload.Params, func(el *models.ParamsParam) bool {
		return el.Name == "FileStorages" && el.Type.Type == models.ParamsTypeArray && el.Type.StructParams != nil
	}))

	s.Require().True(slices.ContainsFunc(formData.Payload.Params, func(el *models.ParamsParam) bool {
		return el.Name == "Placement" && el.Type.Type == models.ParamsTypeStruct && el.Type.StructParams != nil
	}))
	s.Require().True(slices.ContainsFunc(formData.Payload.Params, func(el *models.ParamsParam) bool {
		return el.Name == "Resources" && el.Type.Type == models.ParamsTypeStruct && el.Type.StructParams != nil
	}))
	s.Require().True(slices.ContainsFunc(formData.Payload.Params, func(el *models.ParamsParam) bool {
		return el.Name == "Resharder" && el.Type.Type == models.ParamsTypeStruct && el.Type.StructParams != nil
	}))
	s.Require().True(slices.ContainsFunc(formData.Payload.Params, func(el *models.ParamsParam) bool {
		return el.Name == "States" && el.Type.Type == models.ParamsTypeArray && el.Type.StructParams != nil
	}))
	s.Require().True(slices.ContainsFunc(formData.Payload.Params, func(el *models.ParamsParam) bool {
		return el.Name == "Worker" && el.Type.Type == models.ParamsTypeStruct && el.Type.StructParams != nil
	}))
}
