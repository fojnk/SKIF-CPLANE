package private

import (
	app2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/app"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// TestAppUpcomingBasic проверяет базовую работу upcoming блока
// Примечание: после регенерации swagger клиентов раскомментировать и использовать клиенты
func (s *ControlPlaneTestSuite) TestAppUpcomingBasic() {
	getRes, err := s.c.App.GetAPIV1AppUpcoming(&app2.GetAPIV1AppUpcomingParams{Context: s.ctx})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().Equal("", getRes.Payload.AppUpcoming.Content, "content должен быть пустым по умолчанию")
	s.Require().NotZero(getRes.Payload.AppUpcoming.UpdatedAt, "updated_at должен быть установлен")

	updateRes, err := s.c.App.PutAPIV1AppUpcoming(&app2.PutAPIV1AppUpcomingParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpcomingRequest{
			Content: "# Upcoming Features\n\nNew features coming soon!",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().Equal("# Upcoming Features\n\nNew features coming soon!", updateRes.Payload.AppUpcoming.Content)

	getRes2, err := s.c.App.GetAPIV1AppUpcoming(&app2.GetAPIV1AppUpcomingParams{Context: s.ctx})
	s.Require().NoError(err)
	s.Require().Equal("# Upcoming Features\n\nNew features coming soon!", getRes2.Payload.AppUpcoming.Content)
}

// TestAppUpcomingEmptyContent проверяет, что content может быть пустым
func (s *ControlPlaneTestSuite) TestAppUpcomingEmptyContent() {
	updateRes, err := s.c.App.PutAPIV1AppUpcoming(&app2.PutAPIV1AppUpcomingParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpcomingRequest{
			Content: "",
		},
	})
	s.Require().NoError(err)
	s.Require().Equal("", updateRes.Payload.AppUpcoming.Content)
}
