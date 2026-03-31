package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/user"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestProjectBasic() {

	whoRes, err := s.c.User.GetAPIV1WhoAmI(&user.GetAPIV1WhoAmIParams{
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(whoRes)

	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-prj"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	res, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-project", res.Payload.Name)

	urls, err := s.c.Project.GetAPIV2ProjectUrls(&project2.GetAPIV2ProjectUrlsParams{
		Context:   s.ctx,
		ProjectID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(urls)
	s.Require().NotNil(urls.Payload)
	s.Require().Len(urls.Payload.Urls, 0)

	listRes, err := s.c.Project.GetAPIV1Projects(&project2.GetAPIV1ProjectsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Projects),
		models2.DtoProject{
			ID:   res.Payload.ID,
			Name: "test-project",
		},
	)

	listResV2, err := s.c.Project.PostAPIV2Projects(&project2.PostAPIV2ProjectsParams{
		Context: s.ctx,
		Request: &models2.RequestsListProjectsRequestV2{
			Offset:      ptr(int64(0)),
			Limit:       ptr(int64(10)),
			Search:      "test",
			NamespaceID: nsRes.Payload.ID,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(listResV2)
	s.Require().NotNil(listResV2.Payload)
	s.Require().Equal(listResV2.Payload.Projects[0].NamespaceID, nsRes.Payload.ID)
	s.Require().Equal(listResV2.Payload.Projects[0].NamespaceName, "tst-ns-prj")
	s.Require().Equal(int64(0), listResV2.Payload.Projects[0].ExperimentCount)
	s.Require().Equal(int64(0), listResV2.Payload.Projects[0].DatasetCount)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightCreateExperiment)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightEditConfig)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightCreateDataset)

	getRes, err := s.c.Project.GetAPIV2Project(&project2.GetAPIV2ProjectParams{
		ProjectID: res.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("test-project", getRes.Payload.Name)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightCreateExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightCreateDataset)

	updateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:          ptr(res.Payload.ID),
			Name:        "updated-project",
			Description: "updated-description",
			Config: `{
  						"YT": {
    					"Token": "{{ expscr('scr-RBkrFE4A7zwcBxhEPwXTYH', 'robot-adtech-profile-streamflow') }}",
    					"Cluster": "miranda.yt.idzn.ru",
						"WorkDir": "//home/adtech/adtech-profile/streamflow/internal",
    					"ProxyRole": "adtech-profile-streamflow",
    					"TabletCellBundle": "adtech-profile-streamflow"
  						},
  						"AbcProductId": "4761"
					}`,
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)
	s.Require().Equal("updated-project", updateRes.Payload.Project.Name)
	s.Require().Equal("updated-description", updateRes.Payload.Project.Description)

	urls2, err := s.c.Project.GetAPIV2ProjectUrls(&project2.GetAPIV2ProjectUrlsParams{
		Context:   s.ctx,
		ProjectID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(urls2)
	s.Require().NotNil(urls2.Payload)
	s.Require().Len(urls2.Payload.Urls, 3)

	expectedUrls := []string{
		"https://one.vk.team/abc/services/4761",
		"https://yt.vk.team/miranda/tablet_cell_bundles/tablet_cells?activeBundle=adtech-profile-streamflow",
		"https://yt.vk.team/miranda/navigation?path=//home/adtech/adtech-profile/streamflow/internal",
	}

	expectedUrlNames := []string{
		"ABC product",
		"YT bundle",
		"YT work dir",
	}

	for _, url := range urls2.Payload.Urls {
		s.Require().Contains(expectedUrlNames, url.Name)
		s.Require().Contains(expectedUrls, url.URL)
	}

	getRes, err = s.c.Project.GetAPIV2Project(&project2.GetAPIV2ProjectParams{
		ProjectID: res.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("updated-project", getRes.Payload.Name)
	s.Require().Equal("updated-description", getRes.Payload.Description)

	logs, err := s.c.Project.GetAPIV1ProjectLogs(&project2.GetAPIV1ProjectLogsParams{
		Context:   s.ctx,
		ProjectID: ptr(res.Payload.ID),
		Limit:     int64(10),
		From:      int64(0),
	})
	s.Require().NoError(err)
	s.Require().NotNil(logs)
	s.Require().NotNil(logs.Payload)

	log, err := s.c.Project.GetAPIV1ProjectLog(&project2.GetAPIV1ProjectLogParams{
		Context: s.ctx,
		LogID:   logs.Payload.Logs[len(logs.Payload.Logs)-1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(log)
	s.Require().NotNil(log.Payload)

	resDelete, err := s.c.Project.DeleteAPIV1Project(&project2.DeleteAPIV1ProjectParams{
		Request: &models2.RequestsDeleteProjectRequest{
			ID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDelete)

	listRes, err = s.c.Project.GetAPIV1Projects(&project2.GetAPIV1ProjectsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Empty(listRes.Payload.Projects)

}

func (s *StreamflowTestSuite) TestProjectURLsWithMainClusterAndReplicas() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	res, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-urls"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	// Обновляем конфиг с новым форматом (MainCluster и ReplicaClusters)
	updateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:          ptr(res.Payload.ID),
			Name:        "test-project-urls",
			Description: "test project with main cluster and replicas",
			Config: `{
				"YT": {
					"Token": "{{ expscr('scr-RBkrFE4A7zwcBxhEPwXTYH', 'robot-adtech-profile-streamflow') }}",
					"WorkDir": "//home/adtech/adtech-profile/streamflow/users-lists",
					"MainCluster": {
						"ProxyRole": "adtech-profile-streamflow",
						"ClusterUrl": "miranda.yt.idzn.ru",
						"PrimaryMedium": "ssd_blobs",
						"TabletCellBundle": "adtech-profile-streamflow"
					},
					"ReplicaClusters": [
						{
							"ProxyRole": "default",
							"ClusterUrl": "mercury-kc.yt.idzn.ru",
							"PrimaryMedium": "ssd_blobs",
							"TabletCellBundle": "adtech-profile-streamflow"
						},
						{
							"ProxyRole": "default",
							"ClusterUrl": "mercury-pc.yt.idzn.ru",
							"PrimaryMedium": "ssd_blobs",
							"TabletCellBundle": "adtech-profile-streamflow"
						},
						{
							"ProxyRole": "default",
							"ClusterUrl": "mercury-rc.yt.idzn.ru",
							"PrimaryMedium": "ssd_blobs",
							"TabletCellBundle": "adtech-profile-streamflow"
						}
					]
				},
				"AbcProductId": "4761"
			}`,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)

	// Получаем URLs для проекта
	urls, err := s.c.Project.GetAPIV2ProjectUrls(&project2.GetAPIV2ProjectUrlsParams{
		Context:   s.ctx,
		ProjectID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(urls)
	s.Require().NotNil(urls.Payload)

	// Ожидаем 9 URLs: 1 ABC product (без CLUSTER_NAME) + 4 YT bundle (Main + 3 реплики) + 4 YT work dir (Main + 3 реплики)
	s.Require().Len(urls.Payload.Urls, 9)

	// Проверяем, что есть URLs для главного кластера
	mainClusterUrls := make(map[string]string)
	for _, url := range urls.Payload.Urls {
		if url.Name == "ABC product" {
			mainClusterUrls["ABC product"] = url.URL
		} else if url.Name == "YT bundle (Main)" {
			mainClusterUrls["YT bundle (Main)"] = url.URL
			s.Require().Equal("https://yt.vk.team/miranda/tablet_cell_bundles/tablet_cells?activeBundle=adtech-profile-streamflow", url.URL)
		} else if url.Name == "YT work dir (Main)" {
			mainClusterUrls["YT work dir (Main)"] = url.URL
			s.Require().Equal("https://yt.vk.team/miranda/navigation?path=//home/adtech/adtech-profile/streamflow/users-lists", url.URL)
		}
	}

	// Проверяем URLs для реплик
	replica1Urls := make(map[string]string)
	replica2Urls := make(map[string]string)
	replica3Urls := make(map[string]string)

	for _, url := range urls.Payload.Urls {
		if url.Name == "YT bundle (Replica 1)" {
			replica1Urls["YT bundle (Replica 1)"] = url.URL
			s.Require().Equal("https://yt.vk.team/mercury-kc/tablet_cell_bundles/tablet_cells?activeBundle=adtech-profile-streamflow", url.URL)
		} else if url.Name == "YT work dir (Replica 1)" {
			replica1Urls["YT work dir (Replica 1)"] = url.URL
			s.Require().Equal("https://yt.vk.team/mercury-kc/navigation?path=//home/adtech/adtech-profile/streamflow/users-lists", url.URL)
		} else if url.Name == "YT bundle (Replica 2)" {
			replica2Urls["YT bundle (Replica 2)"] = url.URL
			s.Require().Equal("https://yt.vk.team/mercury-pc/tablet_cell_bundles/tablet_cells?activeBundle=adtech-profile-streamflow", url.URL)
		} else if url.Name == "YT work dir (Replica 2)" {
			replica2Urls["YT work dir (Replica 2)"] = url.URL
			s.Require().Equal("https://yt.vk.team/mercury-pc/navigation?path=//home/adtech/adtech-profile/streamflow/users-lists", url.URL)
		} else if url.Name == "YT bundle (Replica 3)" {
			replica3Urls["YT bundle (Replica 3)"] = url.URL
			s.Require().Equal("https://yt.vk.team/mercury-rc/tablet_cell_bundles/tablet_cells?activeBundle=adtech-profile-streamflow", url.URL)
		} else if url.Name == "YT work dir (Replica 3)" {
			replica3Urls["YT work dir (Replica 3)"] = url.URL
			s.Require().Equal("https://yt.vk.team/mercury-rc/navigation?path=//home/adtech/adtech-profile/streamflow/users-lists", url.URL)
		}
	}

	// Проверяем, что все URLs для главного кластера присутствуют
	s.Require().Equal("https://one.vk.team/abc/services/4761", mainClusterUrls["ABC product"])
	s.Require().NotNil(mainClusterUrls["YT bundle (Main)"])
	s.Require().NotNil(mainClusterUrls["YT work dir (Main)"])

	// Проверяем, что все URLs для реплик присутствуют
	s.Require().NotNil(replica1Urls["YT bundle (Replica 1)"])
	s.Require().NotNil(replica1Urls["YT work dir (Replica 1)"])
	s.Require().NotNil(replica2Urls["YT bundle (Replica 2)"])
	s.Require().NotNil(replica2Urls["YT work dir (Replica 2)"])
	s.Require().NotNil(replica3Urls["YT bundle (Replica 3)"])
	s.Require().NotNil(replica3Urls["YT work dir (Replica 3)"])

	// Проверяем, что ABC product URL присутствует только один раз (не дублируется для каждого кластера)
	abcProductCount := 0
	for _, url := range urls.Payload.Urls {
		if url.Name == "ABC product" {
			abcProductCount++
		}
	}
	s.Require().Equal(1, abcProductCount, "ABC product URL should appear only once")
}

func (s *StreamflowTestSuite) TestProjectURLsBackwardCompatibility() {
	// Тест для проверки обратной совместимости со старым форматом конфига
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	res, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-old-format"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	// Обновляем конфиг со старым форматом (YT.Cluster)
	updateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:          ptr(res.Payload.ID),
			Name:        "test-project-old-format",
			Description: "test project with old config format",
			Config: `{
				"YT": {
					"Token": "{{ expscr('scr-RBkrFE4A7zwcBxhEPwXTYH', 'robot-adtech-profile-streamflow') }}",
					"Cluster": "miranda.yt.idzn.ru",
					"WorkDir": "//home/adtech/adtech-profile/streamflow/internal",
					"ProxyRole": "adtech-profile-streamflow",
					"TabletCellBundle": "adtech-profile-streamflow"
				},
				"AbcProductId": "4761"
			}`,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)

	// Получаем URLs для проекта
	urls, err := s.c.Project.GetAPIV2ProjectUrls(&project2.GetAPIV2ProjectUrlsParams{
		Context:   s.ctx,
		ProjectID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(urls)
	s.Require().NotNil(urls.Payload)

	// Старый формат YT.Cluster (один кластер): ABC product + YT bundle + YT work dir.
	s.Require().Len(urls.Payload.Urls, 3)

	// Проверяем, что URLs сгенерированы правильно
	urlMap := make(map[string]string)
	for _, url := range urls.Payload.Urls {
		urlMap[url.Name] = url.URL
	}

	s.Require().Equal("https://one.vk.team/abc/services/4761", urlMap["ABC product"])
	s.Require().Equal("https://yt.vk.team/miranda/tablet_cell_bundles/tablet_cells?activeBundle=adtech-profile-streamflow", urlMap["YT bundle"])
	s.Require().Equal("https://yt.vk.team/miranda/navigation?path=//home/adtech/adtech-profile/streamflow/internal", urlMap["YT work dir"])

	// Проверяем, что имена URLs не содержат суффиксов (так как только один кластер)
	for _, url := range urls.Payload.Urls {
		s.Require().NotContains(url.Name, "(Main)")
		s.Require().NotContains(url.Name, "(Replica")
	}
}
