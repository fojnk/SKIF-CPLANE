package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/schema"
)

func (s *ControlPlaneTestSuite) TestSchema() {
	schemaVal, err := s.c.Schema.GetAPIV2Schema(&schema.GetAPIV2SchemaParams{
		ConfigType: "experiment",
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(schemaVal)
	s.Require().NotNil(schemaVal.Payload)

	schemaVal, err = s.c.Schema.GetAPIV2Schema(&schema.GetAPIV2SchemaParams{
		ConfigType: "dataset",
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(schemaVal)
	s.Require().NotNil(schemaVal.Payload)

	schemaVal, err = s.c.Schema.GetAPIV2Schema(&schema.GetAPIV2SchemaParams{
		ConfigType: "project",
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(schemaVal)
	s.Require().NotNil(schemaVal.Payload)

	schemaVal, err = s.c.Schema.GetAPIV2Schema(&schema.GetAPIV2SchemaParams{
		ConfigType: "dataset_schema",
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(schemaVal)
	s.Require().NotNil(schemaVal.Payload)
}
