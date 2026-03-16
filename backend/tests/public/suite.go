package public

import (
	"context"

	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
	"github.com/stretchr/testify/suite"
	privateClient "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/robot"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/user"
	privateModels "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
	publicClient "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client"
)

type StreamflowTestSuite struct {
	suite.Suite
	ctx         context.Context
	c           *publicClient.ControlPlanePublicAPI
	privateC    *privateClient.StreamflowControlPlaneAPI
	userID      int64
	RobotID     int64
	userCreated bool
	token       string
}

func (s *StreamflowTestSuite) SetupTest() {
	s.ctx = context.Background()
	transportPublic := httptransport.New("localhost:3002", "", nil)
	s.c = publicClient.New(transportPublic, strfmt.Default)

	transportPrivate := httptransport.New("localhost:3000", "", nil)
	s.privateC = privateClient.New(transportPrivate, strfmt.Default)

	if !s.userCreated {
		userRes, err := s.privateC.User.PostAPIV1User(&user.PostAPIV1UserParams{
			Request: &privateModels.RequestsCreateUserRequest{
				Name: ptr("noauth-user"),
			},
			Context:         s.ctx,
			XSuperuserToken: ptr("super_user_token"),
		})

		s.Require().NoError(err)
		s.Require().NotNil(userRes)

		s.userID = userRes.Payload.ID

		s.grantNamespace(0, s.userID)

		robot, err := s.privateC.Robot.PostAPIV1Robot(&robot.PostAPIV1RobotParams{
			Context: s.ctx,
			Request: &privateModels.RequestsCreateRobotRequest{
				Name: ptr("test-robot"),
			},
		})
		s.Require().NoError(err)
		s.Require().NotNil(robot)

		s.token = robot.Payload.AccessToken.Token

		s.grantNamespace(0, robot.Payload.ID)
		s.RobotID = robot.Payload.ID

		s.userCreated = true
	}
}
