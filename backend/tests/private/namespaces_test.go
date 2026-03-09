package private

import (
	namespace2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *ControlPlaneTestSuite) TestNamespaceBasic() {
	res, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("dplatform"),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	s.grantNamespace(res.Payload.ID)

	res1, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Contains(
		derefSlice(s.T(), res1.Payload.Namespaces),
		models2.DtoNamespace{
			ID:     res.Payload.ID,
			Name:   "dplatform",
			Rights: []models2.ACLRight{"edit_config", "edit_name", "create_project", "delete_namespace"},
		},
	)
	s.Require().Equal(true, res1.Payload.CanCreate)

	res2, err := s.c.Namespace.GetAPIV1Namespace(&namespace2.GetAPIV1NamespaceParams{
		Context:     s.ctx,
		NamespaceID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res2)
	s.Require().NotNil(res2.Payload)
	s.Require().Equal(res.Payload.ID, res2.Payload.ID)
	s.Require().Equal("dplatform", res2.Payload.Name)
	s.Require().Equal("{}", res2.Payload.Config)
	s.Require().Contains(res2.Payload.Rights, models2.ACLRightCreateProject)
	s.Require().Contains(res2.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(res2.Payload.Rights, models2.ACLRightEditName)

	_, err = s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &res.Payload.ID,
			Name:   "updated-namespacesadfsfdasdfasdfas",
			Config: `{"test": "test"}`,
		},
	})
	s.Require().Error(err)

	updateRes, err := s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &res.Payload.ID,
			Name:   "upd-ns",
			Config: `{"test": "test"}`,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().Equal(res.Payload.ID, updateRes.Payload.ID)
	s.Require().Equal("upd-ns", updateRes.Payload.Name)
	s.Require().Equal(`{"test": "test"}`, updateRes.Payload.Config)

	res3, err := s.c.Namespace.GetAPIV1Namespace(&namespace2.GetAPIV1NamespaceParams{
		Context:     s.ctx,
		NamespaceID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res3)
	s.Require().NotNil(res3.Payload)
	s.Require().Equal(res.Payload.ID, res3.Payload.ID)
	s.Require().Equal("upd-ns", res3.Payload.Name)
	s.Require().Equal(`{"test": "test"}`, res3.Payload.Config)

	listLogsRes, err := s.c.Namespace.GetAPIV1NamespaceLogs(&namespace2.GetAPIV1NamespaceLogsParams{
		NamespaceID: &res.Payload.ID,
		From:        0,
		Limit:       10,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)
	s.Require().Len(listLogsRes.Payload.Logs, 2)

	listLogsRes1, err := s.c.Namespace.GetAPIV1NamespaceLogs(&namespace2.GetAPIV1NamespaceLogsParams{
		NamespaceID: &res.Payload.ID,
		From:        0,
		Limit:       2,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes1)
	s.Require().NotNil(listLogsRes1.Payload)
	s.Require().Len(listLogsRes1.Payload.Logs, 2)
	s.Require().Equal(int64(1), listLogsRes1.Payload.Pages)

	listLogsRes2, err := s.c.Namespace.GetAPIV1NamespaceLogs(&namespace2.GetAPIV1NamespaceLogsParams{
		NamespaceID: &res.Payload.ID,
		From:        0,
		Limit:       1,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes2)
	s.Require().NotNil(listLogsRes2.Payload)
	s.Require().Len(listLogsRes2.Payload.Logs, 1)
	s.Require().Equal(int64(2), listLogsRes2.Payload.Total)
	s.Require().Equal(int64(2), listLogsRes2.Payload.Pages)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("new", listLogsRes.Payload.Logs[1].Act)
	s.Require().Equal("upd-ns", listLogsRes.Payload.Logs[1].Name)
	s.Require().Equal(int64(1), listLogsRes.Payload.Pages)

	details1, err := s.c.Namespace.GetAPIV1NamespaceLog(&namespace2.GetAPIV1NamespaceLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("dplatform", details1.Payload.Details.New.Name)
	s.Require().Equal("{}", details1.Payload.Details.New.Config)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("update", listLogsRes.Payload.Logs[0].Act)
	s.Require().Equal("upd-ns", listLogsRes.Payload.Logs[0].Name)

	details2, err := s.c.Namespace.GetAPIV1NamespaceLog(&namespace2.GetAPIV1NamespaceLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("upd-ns", details2.Payload.Details.New.Name)
	s.Require().Equal("dplatform", details2.Payload.Details.Old.Name)
	s.Require().NotEqual(int32(0), details2.Payload.Details.New.ConfigVersionID)
	s.Require().Equal("", details2.Payload.Comment)

	_, err = s.c.Namespace.PutAPIV1NamespaceLog(&namespace2.PutAPIV1NamespaceLogParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateNamespaceLogCommentRequest{
			LogID:      &listLogsRes.Payload.Logs[0].ID,
			NewComment: ptr("new comment"),
		},
	})

	details3, err := s.c.Namespace.GetAPIV1NamespaceLog(&namespace2.GetAPIV1NamespaceLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("upd-ns", details3.Payload.Details.New.Name)
	s.Require().Equal("dplatform", details3.Payload.Details.Old.Name)
	s.Require().NotEqual(int32(0), details3.Payload.Details.New.ConfigVersionID)
	s.Require().Equal("new comment", details3.Payload.Comment)
}

func (s *ControlPlaneTestSuite) TestNamespaceDelete() {
	namespacesCount, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(namespacesCount)
	s.Require().NotNil(namespacesCount.Payload)

	namespacesCountLen := len(namespacesCount.Payload.Namespaces)

	res, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("ns-del"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	s.grantNamespace(res.Payload.ID)

	res1, err := s.c.Namespace.DeleteAPIV1Namespace(&namespace2.DeleteAPIV1NamespaceParams{
		Context: s.ctx,
		Request: &models2.RequestsDeleteNamespaceRequest{
			ID: &res.Payload.ID,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(res1)
	s.Require().NotNil(res1.Payload)

	res2, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res2)
	s.Require().NotNil(res2.Payload)
	s.Require().Len(res2.Payload.Namespaces, namespacesCountLen)
	res3, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("ns-del"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res3)
	s.Require().NotNil(res3.Payload)

	res4, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res4)
	s.Require().NotNil(res4.Payload)
	s.Require().Len(res4.Payload.Namespaces, namespacesCountLen+1)
	s.Require().Equal("ns-del", res4.Payload.Namespaces[0].Name)

	res5, err := s.c.Namespace.DeleteAPIV1Namespace(&namespace2.DeleteAPIV1NamespaceParams{
		Context: s.ctx,
		Request: &models2.RequestsDeleteNamespaceRequest{
			ID: &res3.Payload.ID,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(res5)
	s.Require().NotNil(res5.Payload)

	res6, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res6)
	s.Require().NotNil(res6.Payload)
	s.Require().Len(res6.Payload.Namespaces, namespacesCountLen)

	res7, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("ns-del"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res7)
	s.Require().NotNil(res7.Payload)

	res8, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res8)
	s.Require().NotNil(res8.Payload)
	s.Require().Len(res8.Payload.Namespaces, namespacesCountLen+1)
	s.Require().Equal("ns-del", res8.Payload.Namespaces[0].Name)
}
