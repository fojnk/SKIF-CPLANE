package private

import (
	"context"

	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
	"github.com/stretchr/testify/suite"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

const testUserName string = "noauth-user"

type ControlPlaneTestSuite struct {
	suite.Suite
	ctx         context.Context
	c           *client.ControlPlaneAPI
	userID      int64
	userCreated bool
}

func (s *ControlPlaneTestSuite) SetupTest() {
	s.ctx = context.Background()
	transport := httptransport.New("localhost:3000", "", nil)
	s.c = client.New(transport, strfmt.Default)

	if !s.userCreated {
		userRes, err := s.c.User.PostAPIV1User(&user.PostAPIV1UserParams{
			Request: &models.RequestsCreateUserRequest{
				Name: ptr(testUserName),
			},
			Context:         s.ctx,
			XSuperuserToken: ptr("super_user_token"),
		})

		s.Require().NoError(err)
		s.Require().NotNil(userRes)

		s.userID = userRes.Payload.ID

		s.grantNamespace(0)
		s.userCreated = true
	}
}
