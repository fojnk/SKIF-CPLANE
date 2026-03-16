package private

import (
	cacl "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/acl"
	app2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/app"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/rule"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/user_match"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// TestAppIsAdmin проверяет работу ручки is-admin
// Примечание: после регенерации swagger клиентов раскомментировать и использовать клиенты
func (s *StreamflowTestSuite) TestAppIsAdmin() {
	getRes, err := s.c.App.GetAPIV1AppIsAdmin(&app2.GetAPIV1AppIsAdminParams{Context: s.ctx})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().True(getRes.Payload.IsAdmin, "Пользователь с правами админа должен получить is_admin=true")
}

// TestAppIsAdminNonAdmin проверяет, что пользователь без прав админа получает is_admin=false
func (s *StreamflowTestSuite) TestAppIsAdminNonAdmin() {
	// Получаем все правила для текущего пользователя
	matchesRes, err := s.c.UserMatch.GetAPIV1UserMatches(&user_match.GetAPIV1UserMatchesParams{
		UserID:          s.userID,
		Context:         s.ctx,
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(matchesRes)
	s.Require().NotNil(matchesRes.Payload)

	// Находим правило для root namespace с действием 03D (админские права)
	var adminRuleID *int64
	for _, rule := range matchesRes.Payload.Rules {
		if rule != nil &&
			rule.ObjectType == "root" &&
			rule.ObjectAttribute == "namespace" &&
			rule.ObjectID == 0 &&
			rule.Action == "03D" &&
			rule.RuleID != 0 {
			ruleID := rule.RuleID
			adminRuleID = &ruleID
			break
		}
	}

	// Если найдено правило админа, отзываем его
	if adminRuleID != nil {
		_, err = s.c.ACL.PostAPIV1Disclaim(&cacl.PostAPIV1DisclaimParams{
			Request: &models2.RequestsDisclaimRequest{
				UserID: s.userID,
				RuleID: *adminRuleID,
			},
			XSuperuserToken: ptr("super_user_token"),
			Context:         s.ctx,
		})
		s.Require().NoError(err)

		// Проверяем, что теперь is_admin=false
		getRes, err := s.c.App.GetAPIV1AppIsAdmin(&app2.GetAPIV1AppIsAdminParams{Context: s.ctx})
		s.Require().NoError(err)
		s.Require().NotNil(getRes)
		s.Require().False(getRes.Payload.IsAdmin, "Пользователь без прав админа должен получить is_admin=false")

		// Восстанавливаем админские права для следующих тестов
		s.grantRule(*adminRuleID)
	} else {
		// Если правило не найдено, создаем новое и отзываем его для проверки
		req := models2.RequestsCreateRuleRequest{
			ObjectType:      ptr("root"),
			ObjectAttribute: ptr("namespace"),
			ObjectID:        ptr(int64(0)),
			Action:          ptr("03D"),
		}

		ruleRes, err := s.c.Rule.PostAPIV1Rule(&rule.PostAPIV1RuleParams{
			Request:         &req,
			XSuperuserToken: ptr("super_user_token"),
			Context:         s.ctx,
		})
		s.Require().NoError(err)
		s.Require().NotNil(ruleRes)

		// Сначала предоставляем правило (чтобы потом его отозвать)
		s.grantRule(ruleRes.Payload.ID)

		// Отзываем админские права у текущего пользователя
		_, err = s.c.ACL.PostAPIV1Disclaim(&cacl.PostAPIV1DisclaimParams{
			Request: &models2.RequestsDisclaimRequest{
				UserID: s.userID,
				RuleID: ruleRes.Payload.ID,
			},
			XSuperuserToken: ptr("super_user_token"),
			Context:         s.ctx,
		})
		s.Require().NoError(err)

		// Проверяем, что теперь is_admin=false
		getRes, err := s.c.App.GetAPIV1AppIsAdmin(&app2.GetAPIV1AppIsAdminParams{Context: s.ctx})
		s.Require().NoError(err)
		s.Require().NotNil(getRes)
		s.Require().False(getRes.Payload.IsAdmin, "Пользователь без прав админа должен получить is_admin=false")

		// Восстанавливаем админские права для следующих тестов
		s.grantRule(ruleRes.Payload.ID)
	}
}
