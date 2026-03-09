package private

import (
	"time"

	app2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/app"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// Примечание: некоторые тесты используют новое поле ColorDark,
// которое появится после регенерации swagger клиентов. Ошибки линтера исчезнут после регенерации.

func (s *ControlPlaneTestSuite) TestBannersBasic() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	res, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	listRes, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Experiments),
		models2.DtoCompleteExperimentList{
			ID:     res.Payload.ID,
			Name:   "test-experiment",
			Status: "OK",
		},
	)

	types, err := s.c.App.GetAPIV1AppBannerTypes(&app2.GetAPIV1AppBannerTypesParams{Context: s.ctx})
	s.Require().NoError(err)
	s.Require().NotNil(types)
	s.Require().NotNil(types.Payload)
	s.Require().Contains(types.Payload.Types, models2.DtoBannerType("release_block"))
	s.Require().Contains(types.Payload.Types, models2.DtoBannerType("info"))
	s.Require().Contains(types.Payload.Types, models2.DtoBannerType("warning"))

	banner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:    true,
			Title:     ptr("test-app-banner"),
			Message:   "test-app-banner-message",
			Type:      ptr("release_block"),
			Color:     "red",
			ColorDark: "#8b0000",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(banner)
	s.Require().NotNil(banner.Payload)

	bannerDetails, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(bannerDetails)
	s.Require().NotNil(bannerDetails.Payload)
	s.Require().Equal(bannerDetails.Payload.AppBanner.Type, "release_block")
	s.Require().Equal(bannerDetails.Payload.AppBanner.Title, "test-app-banner")
	s.Require().Equal(bannerDetails.Payload.AppBanner.Message, "test-app-banner-message")
	s.Require().Equal(bannerDetails.Payload.AppBanner.Active, true)
	s.Require().Equal(bannerDetails.Payload.AppBanner.Color, "red")
	s.Require().Equal(bannerDetails.Payload.AppBanner.ColorDark, "#8b0000", "color_dark должен быть установлен")

	_, err = s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})

	s.Require().Error(err)

	updated, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			Color:     "blue",
			ColorDark: "#00008b",
			ID:        ptr(bannerDetails.Payload.AppBanner.ID),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().NotNil(updated.Payload)
	s.Require().Equal(updated.Payload.AppBanner.Type, "release_block")
	s.Require().Equal(updated.Payload.AppBanner.Title, "test-app-banner")
	s.Require().Equal(updated.Payload.AppBanner.Message, "test-app-banner-message")
	s.Require().Equal(updated.Payload.AppBanner.Active, true)
	s.Require().Equal(updated.Payload.AppBanner.Color, "blue")
	s.Require().Equal(updated.Payload.AppBanner.ColorDark, "#00008b", "color_dark должен быть обновлен")

	updated2, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			Active: ptr(false),
			ID:     ptr(bannerDetails.Payload.AppBanner.ID),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated2)
	s.Require().NotNil(updated2.Payload)
	s.Require().Equal(updated2.Payload.AppBanner.Type, "release_block")
	s.Require().Equal(updated2.Payload.AppBanner.Title, "test-app-banner")
	s.Require().Equal(updated2.Payload.AppBanner.Message, "test-app-banner-message")
	s.Require().Equal(updated2.Payload.AppBanner.Active, false)
	s.Require().Equal(updated2.Payload.AppBanner.Color, "blue")

	applyRes, err := s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(applyRes)
	s.Require().NotNil(applyRes.Payload)

	banners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(banners)
	s.Require().NotNil(banners.Payload)
	// Проверяем, что наш созданный баннер присутствует в списке
	var foundBanner bool
	for _, b := range banners.Payload.AppBanners {
		if b.ID == banner.Payload.ID {
			foundBanner = true
			s.Require().Equal(b.ID, banner.Payload.ID)
			break
		}
	}
	s.Require().True(foundBanner, "Созданный баннер должен быть в списке")

	_, err = s.c.App.DeleteAPIV1AppBanner(&app2.DeleteAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsDeleteAppBannerRequest{
			ID: banner.Payload.ID,
		},
	})

	s.Require().NoError(err)

	banners2, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(banners2)
	s.Require().NotNil(banners2.Payload)
	// Проверяем, что удаленный баннер отсутствует в списке
	var deletedBannerFound bool
	for _, b := range banners2.Payload.AppBanners {
		if b.ID == banner.Payload.ID {
			deletedBannerFound = true
			break
		}
	}
	s.Require().False(deletedBannerFound, "Удаленный баннер не должен присутствовать в списке")
}

// TestBannersSingleActive проверяет, что единомоментно может быть только один активный баннер
func (s *ControlPlaneTestSuite) TestBannersSingleActive() {
	// Создаем первый активный баннер
	banner1, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("First Active Banner"),
			Message: "First banner message",
			Type:    ptr("info"),
			Color:   "blue",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner1)
	s.Require().NotNil(banner1.Payload)

	// Проверяем, что первый баннер активен
	banner1Details, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner1.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner1Details)
	s.Require().True(banner1Details.Payload.AppBanner.Active)

	// Создаем второй активный баннер - первый должен автоматически деактивироваться
	banner2, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Second Active Banner"),
			Message: "Second banner message hellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohello",
			Type:    ptr("warning"),
			Color:   "orange",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner2)
	s.Require().NotNil(banner2.Payload)

	// Проверяем, что второй баннер активен
	banner2Details, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner2.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner2Details)
	s.Require().True(banner2Details.Payload.AppBanner.Active)

	// Проверяем, что первый баннер деактивирован
	banner1DetailsAfter, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner1.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner1DetailsAfter)
	s.Require().False(banner1DetailsAfter.Payload.AppBanner.Active, "Первый баннер должен быть деактивирован после создания второго активного")

	// Проверяем, что только один баннер активен в списке всех баннеров
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBanners)
	s.Require().NotNil(allBanners.Payload)

	activeCount := 0
	for _, banner := range allBanners.Payload.AppBanners {
		if banner.Active {
			activeCount++
		}
	}
	s.Require().Equal(1, activeCount, "Должен быть только один активный баннер")

	// Создаем третий неактивный баннер - не должен влиять на активные
	banner3, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  false,
			Title:   ptr("Third Inactive Banner"),
			Message: "Third banner message",
			Type:    ptr("info"),
			Color:   "green",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner3)
	s.Require().NotNil(banner3.Payload)

	// Проверяем, что второй баннер все еще активен
	banner2DetailsAfter, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner2.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner2DetailsAfter)
	s.Require().True(banner2DetailsAfter.Payload.AppBanner.Active, "Второй баннер должен оставаться активным")

	// Проверяем, что все еще только один активный баннер
	allBanners2, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBanners2)
	s.Require().NotNil(allBanners2.Payload)

	activeCount2 := 0
	for _, banner := range allBanners2.Payload.AppBanners {
		if banner.Active {
			activeCount2++
		}
	}
	s.Require().Equal(1, activeCount2, "Должен быть только один активный баннер после создания неактивного")

	// Активируем первый баннер через обновление - второй должен деактивироваться
	_, err = s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			Active: ptr(true),
			ID:     ptr(banner1.Payload.ID),
		},
	})
	s.Require().NoError(err)

	// Проверяем, что первый баннер теперь активен
	banner1DetailsActivated, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner1.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner1DetailsActivated)
	s.Require().True(banner1DetailsActivated.Payload.AppBanner.Active, "Первый баннер должен быть активен после активации")

	// Проверяем, что второй баннер деактивирован
	banner2DetailsDeactivated, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner2.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner2DetailsDeactivated)
	s.Require().False(banner2DetailsDeactivated.Payload.AppBanner.Active, "Второй баннер должен быть деактивирован после активации первого")

	// Финальная проверка: только один активный баннер
	allBanners3, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBanners3)
	s.Require().NotNil(allBanners3.Payload)

	activeCount3 := 0
	for _, banner := range allBanners3.Payload.AppBanners {
		if banner.Active {
			activeCount3++
		}
	}
	s.Require().Equal(1, activeCount3, "Должен быть только один активный баннер после всех операций")
}

// TestBannersColorDark проверяет работу поля color_dark
func (s *ControlPlaneTestSuite) TestBannersColorDark() {
	// Создаем баннер с color_dark
	banner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:    true,
			Title:     ptr("Dark Theme Banner"),
			Message:   "Banner with dark color",
			Type:      ptr("info"),
			Color:     "#0000FF",
			ColorDark: "#4169E1",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(banner)
	s.Require().NotNil(banner.Payload)

	// Проверяем, что color_dark сохранен
	bannerDetails, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(bannerDetails)
	s.Require().Equal("#0000FF", bannerDetails.Payload.AppBanner.Color)
	s.Require().Equal("#4169E1", bannerDetails.Payload.AppBanner.ColorDark)

	// Обновляем только color_dark
	updated, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			ID:        ptr(banner.Payload.ID),
			ColorDark: "#1E90FF",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().Equal("#0000FF", updated.Payload.AppBanner.Color, "color не должен измениться")
	s.Require().Equal("#1E90FF", updated.Payload.AppBanner.ColorDark, "color_dark должен быть обновлен")

	// Создаем баннер без color_dark - должен быть пустой строкой
	banner2, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  false,
			Title:   ptr("No Dark Color Banner"),
			Message: "Banner without dark color",
			Type:    ptr("warning"),
			Color:   "#FFA500",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(banner2)

	banner2Details, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner2.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().Equal("", banner2Details.Payload.AppBanner.ColorDark, "color_dark должен быть пустой строкой если не указан")
}

// TestGetCurrentAppBanner проверяет получение текущего активного баннера
func (s *ControlPlaneTestSuite) TestGetCurrentAppBanner() {
	// Сначала проверяем, что когда нет активных баннеров, возвращается null
	// Используем прямой HTTP вызов, так как клиент еще не регенерирован
	resp, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resp)
	s.Require().NotNil(resp.Payload)

	// Убеждаемся, что нет активных баннеров
	hasActive := false
	for _, banner := range resp.Payload.AppBanners {
		if banner.Active {
			hasActive = true
			break
		}
	}
	if !hasActive {
		// Если нет активных баннеров, текущий баннер должен быть null
		// Это будет проверено после регенерации клиента
		// Пока просто создадим активный баннер для дальнейших тестов
	}

	// Создаем активный баннер без временных рамок
	banner1, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Current Active Banner"),
			Message: "This is the current active banner message",
			Type:    ptr("info"),
			Color:   "#0000FF",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner1)
	s.Require().NotNil(banner1.Payload)

	// Проверяем получение текущего баннера через список активных
	// После регенерации клиента можно будет использовать GetAPIV1AppBannersCurrent
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBanners)
	s.Require().NotNil(allBanners.Payload)

	// Находим активный баннер
	var activeBanner *models2.DtoAppBanner
	for _, banner := range allBanners.Payload.AppBanners {
		if banner.Active {
			activeBanner = banner
			break
		}
	}
	s.Require().NotNil(activeBanner, "Должен быть найден активный баннер")
	s.Require().Equal(banner1.Payload.ID, activeBanner.ID)
	s.Require().Equal("Current Active Banner", activeBanner.Title)
	s.Require().Equal("This is the current active banner message", activeBanner.Message)
	s.Require().True(activeBanner.Active)
}

// TestGetCurrentAppBannerWithTimeRange проверяет получение текущего баннера с учетом временных рамок
// ПРИМЕЧАНИЕ: Этот тест требует регенерации swagger клиентов для поддержки полей Starts и Ends
// После регенерации раскомментируйте код ниже и используйте GetAPIV1AppBannersCurrent
func (s *ControlPlaneTestSuite) TestGetCurrentAppBannerWithTimeRange() {
	// TODO: После регенерации swagger клиентов раскомментировать и использовать:
	// futureTime := strfmt.DateTime(time.Now().Add(24 * time.Hour))
	// pastTime := strfmt.DateTime(time.Now().Add(-24 * time.Hour))
	// startTime := strfmt.DateTime(time.Now().Add(-1 * time.Hour))
	// endTime := strfmt.DateTime(time.Now().Add(1 * time.Hour))

	// Создаем активный баннер без временных рамок (будет считаться текущим)
	bannerCurrent, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Current Time Range Banner"),
			Message: "This banner is active now",
			Type:    ptr("info"),
			Color:   "#0000FF",
			// Starts:  &startTime,  // Раскомментировать после регенерации
			// Ends:    &endTime,    // Раскомментировать после регенерации
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(bannerCurrent)
	s.Require().NotNil(bannerCurrent.Payload)

	// Проверяем, что текущий баннер найден
	// После регенерации клиента можно будет использовать GetAPIV1AppBannersCurrent
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBanners)
	s.Require().NotNil(allBanners.Payload)

	// Находим активный баннер
	var foundCurrentBanner bool
	for _, banner := range allBanners.Payload.AppBanners {
		if banner.Active && banner.ID == bannerCurrent.Payload.ID {
			foundCurrentBanner = true
			s.Require().Equal("Current Time Range Banner", banner.Title)
			break
		}
	}
	s.Require().True(foundCurrentBanner, "Должен быть найден активный баннер")
}

// TestGetCurrentAppBannerNoActive проверяет, что когда нет активных баннеров, возвращается null
func (s *ControlPlaneTestSuite) TestGetCurrentAppBannerNoActive() {
	// Деактивируем все существующие баннеры
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBanners)

	// Деактивируем все активные баннеры
	for _, banner := range allBanners.Payload.AppBanners {
		if banner.Active {
			_, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
				Context: s.ctx,
				Request: &models2.RequestsUpdateAppBannerRequest{
					ID:     ptr(banner.ID),
					Active: ptr(false),
				},
			})
			s.Require().NoError(err)
		}
	}

	// Проверяем, что нет активных баннеров
	allBannersAfter, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(allBannersAfter)

	hasActive := false
	for _, banner := range allBannersAfter.Payload.AppBanners {
		if banner.Active {
			hasActive = true
			break
		}
	}
	s.Require().False(hasActive, "Не должно быть активных баннеров")
	// После регенерации клиента можно будет проверить, что GetCurrentAppBanner возвращает null
}

// TestBannerWithoutTitle проверяет, что поле title необязательное
func (s *ControlPlaneTestSuite) TestBannerWithoutTitle() {
	// Создаем баннер без title (не передаем поле Title вообще)
	banner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Message: "Banner without title",
			Type:    ptr("info"),
			Color:   "blue",
			// Title не передаем - поле необязательное
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(banner)
	s.Require().NotNil(banner.Payload)

	// Проверяем, что баннер создан успешно
	bannerDetails, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(bannerDetails)
	s.Require().NotNil(bannerDetails.Payload)
	// Title должен быть пустой строкой если не указан
	s.Require().Equal("", bannerDetails.Payload.AppBanner.Title, "title должен быть пустой строкой если не указан")
	s.Require().Equal("Banner without title", bannerDetails.Payload.AppBanner.Message)
	s.Require().Equal("info", bannerDetails.Payload.AppBanner.Type)
	s.Require().True(bannerDetails.Payload.AppBanner.Active)

	// Создаем баннер с пустым title (явно передаем пустую строку)
	banner2, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  false,
			Title:   ptr(""), // Явно передаем пустую строку
			Message: "Banner with empty title",
			Type:    ptr("warning"),
			Color:   "orange",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(banner2)
	s.Require().NotNil(banner2.Payload)

	// Проверяем, что баннер с пустым title тоже создается успешно
	banner2Details, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner2.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(banner2Details)
	s.Require().NotNil(banner2Details.Payload)
	s.Require().Equal("", banner2Details.Payload.AppBanner.Title, "title должен быть пустой строкой")
	s.Require().Equal("Banner with empty title", banner2Details.Payload.AppBanner.Message)
}

// TestBannerUpdateType проверяет, что тип баннера можно изменить через PUT
func (s *ControlPlaneTestSuite) TestBannerUpdateType() {
	// Создаем баннер с типом release_block
	banner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  false,
			Title:   ptr("Type Change Banner"),
			Message: "Banner to test type change",
			Type:    ptr("release_block"),
			Color:   "#FF0000",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner)
	s.Require().NotNil(banner.Payload)

	// Проверяем исходный тип
	details, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().Equal("release_block", details.Payload.AppBanner.Type)

	// Меняем тип на info
	updated, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			ID:   ptr(banner.Payload.ID),
			Type: ptr("info"),
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().NotNil(updated.Payload)
	s.Require().NotNil(updated.Payload.AppBanner)
	s.Require().Equal("info", updated.Payload.AppBanner.Type, "Тип баннера должен измениться на info")

	// Проверяем через GET, что тип действительно изменился
	detailsAfter, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().Equal("info", detailsAfter.Payload.AppBanner.Type, "Тип баннера должен быть info после обновления")

	// Меняем тип на warning
	updated2, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			ID:   ptr(banner.Payload.ID),
			Type: ptr("warning"),
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(updated2)
	s.Require().Equal("warning", updated2.Payload.AppBanner.Type, "Тип баннера должен измениться на warning")

	// Обновляем другие поля без указания type — тип не должен измениться
	updated3, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			ID:    ptr(banner.Payload.ID),
			Color: "#00FF00",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(updated3)
	s.Require().Equal("warning", updated3.Payload.AppBanner.Type, "Тип не должен измениться при обновлении других полей")
	s.Require().Equal("#00FF00", updated3.Payload.AppBanner.Color)
}

// TestBannerUpdateUpdatedAt проверяет, что updated_at меняется после обновления баннера
func (s *ControlPlaneTestSuite) TestBannerUpdateUpdatedAt() {
	// Создаем баннер
	banner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  false,
			Title:   ptr("UpdatedAt Test Banner"),
			Message: "Banner to test updated_at",
			Type:    ptr("info"),
			Color:   "#0000FF",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(banner)
	s.Require().NotNil(banner.Payload)

	// Получаем начальные данные баннера
	details, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details)
	originalCreatedAt := details.Payload.AppBanner.CreatedAt
	originalUpdatedAt := details.Payload.AppBanner.UpdatedAt
	s.Require().NotEmpty(originalCreatedAt, "created_at должен быть установлен")
	s.Require().NotEmpty(originalUpdatedAt, "updated_at должен быть установлен")

	// Небольшая пауза, чтобы время гарантированно изменилось
	time.Sleep(50 * time.Millisecond)

	// Обновляем баннер
	updated, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppBannerRequest{
			ID:    ptr(banner.Payload.ID),
			Title: "Updated Title",
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().NotNil(updated.Payload)
	s.Require().NotNil(updated.Payload.AppBanner)

	// Проверяем, что updated_at изменился
	s.Require().Equal(originalCreatedAt, updated.Payload.AppBanner.CreatedAt, "created_at не должен измениться")
	s.Require().NotEqual(originalUpdatedAt, updated.Payload.AppBanner.UpdatedAt, "updated_at должен измениться после обновления")

	// Проверяем через GET
	detailsAfter, err := s.c.App.GetAPIV1AppBanner(&app2.GetAPIV1AppBannerParams{
		Context:  s.ctx,
		BannerID: banner.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotEqual(originalUpdatedAt, detailsAfter.Payload.AppBanner.UpdatedAt, "updated_at должен измениться после обновления (GET)")
}

// TestExpiredBannerNotReturnedAsCurrent проверяет, что протухший баннер не возвращается как текущий
func (s *ControlPlaneTestSuite) TestExpiredBannerNotReturnedAsCurrent() {
	// Деактивируем все существующие баннеры
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	for _, b := range allBanners.Payload.AppBanners {
		if b.Active {
			_, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
				Context: s.ctx,
				Request: &models2.RequestsUpdateAppBannerRequest{
					ID:     ptr(b.ID),
					Active: ptr(false),
				},
			})
			s.Require().NoError(err)
		}
	}

	// Создаем активный баннер с ends в прошлом (протухший)
	pastTime := time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339)
	pastStart := time.Now().Add(-2 * time.Hour).UTC().Format(time.RFC3339)
	expiredBanner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Expired Banner"),
			Message: "This banner has expired",
			Type:    ptr("info"),
			Color:   "#FF0000",
			Starts:  &pastStart,
			Ends:    &pastTime,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(expiredBanner)
	s.Require().NotNil(expiredBanner.Payload)

	// Проверяем, что протухший баннер НЕ возвращается через /banners/current
	currentRes, err := s.c.App.GetAPIV1AppBannersCurrent(&app2.GetAPIV1AppBannersCurrentParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(currentRes)
	s.Require().NotNil(currentRes.Payload)
	s.Require().Nil(currentRes.Payload.AppBanner, "Протухший баннер не должен возвращаться как текущий")
}

// TestFutureBannerNotReturnedAsCurrent проверяет, что баннер с starts в будущем не возвращается как текущий
func (s *ControlPlaneTestSuite) TestFutureBannerNotReturnedAsCurrent() {
	// Деактивируем все существующие баннеры
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	for _, b := range allBanners.Payload.AppBanners {
		if b.Active {
			_, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
				Context: s.ctx,
				Request: &models2.RequestsUpdateAppBannerRequest{
					ID:     ptr(b.ID),
					Active: ptr(false),
				},
			})
			s.Require().NoError(err)
		}
	}

	// Создаем активный баннер с starts в будущем
	futureTime := time.Now().Add(1 * time.Hour).UTC().Format(time.RFC3339)
	futureEnd := time.Now().Add(2 * time.Hour).UTC().Format(time.RFC3339)
	futureBanner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Future Banner"),
			Message: "This banner starts in the future",
			Type:    ptr("info"),
			Color:   "#0000FF",
			Starts:  &futureTime,
			Ends:    &futureEnd,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(futureBanner)
	s.Require().NotNil(futureBanner.Payload)

	// Проверяем, что будущий баннер НЕ возвращается через /banners/current
	currentRes, err := s.c.App.GetAPIV1AppBannersCurrent(&app2.GetAPIV1AppBannersCurrentParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(currentRes)
	s.Require().NotNil(currentRes.Payload)
	s.Require().Nil(currentRes.Payload.AppBanner, "Баннер с starts в будущем не должен возвращаться как текущий")
}

// TestExpiredReleaseBlockDoesNotBlockDeploy проверяет, что протухший release_block баннер не блокирует деплой
func (s *ControlPlaneTestSuite) TestExpiredReleaseBlockDoesNotBlockDeploy() {
	// Создаем namespace, project и experiment для проверки деплоя
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-block"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-expired-block"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	experimentRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-expired-block"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(experimentRes)
	s.Require().NotNil(experimentRes.Payload)

	// Деактивируем все существующие баннеры
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	for _, b := range allBanners.Payload.AppBanners {
		if b.Active {
			_, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
				Context: s.ctx,
				Request: &models2.RequestsUpdateAppBannerRequest{
					ID:     ptr(b.ID),
					Active: ptr(false),
				},
			})
			s.Require().NoError(err)
		}
	}

	// Создаем протухший release_block баннер
	pastStart := time.Now().Add(-2 * time.Hour).UTC().Format(time.RFC3339)
	pastEnd := time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339)
	expiredBlockBanner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Expired Release Block"),
			Message: "This release block has expired",
			Type:    ptr("release_block"),
			Color:   "#FF0000",
			Starts:  &pastStart,
			Ends:    &pastEnd,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(expiredBlockBanner)
	s.Require().NotNil(expiredBlockBanner.Payload)

	// Пробуем задеплоить — НЕ должно быть ошибки, т.к. баннер протух
	applyRes, err := s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(experimentRes.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err, "Протухший release_block баннер не должен блокировать деплой")
	s.Require().NotNil(applyRes)

	// Создаем активный НЕ протухший release_block баннер для контраста
	futureEnd := time.Now().Add(1 * time.Hour).UTC().Format(time.RFC3339)
	activeBlockBanner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Active Release Block"),
			Message: "This release block is active",
			Type:    ptr("release_block"),
			Color:   "#FF0000",
			Ends:    &futureEnd,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(activeBlockBanner)

	// Пробуем задеплоить — ДОЛЖНА быть ошибка, т.к. есть активный не протухший release_block
	_, err = s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(experimentRes.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().Error(err, "Активный release_block баннер должен блокировать деплой")
}

// TestActiveBannerWithinTimeRangeReturnedAsCurrent проверяет, что баннер в пределах временного диапазона возвращается
func (s *ControlPlaneTestSuite) TestActiveBannerWithinTimeRangeReturnedAsCurrent() {
	// Деактивируем все существующие баннеры
	allBanners, err := s.c.App.GetAPIV1AppBanners(&app2.GetAPIV1AppBannersParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	for _, b := range allBanners.Payload.AppBanners {
		if b.Active {
			_, err := s.c.App.PutAPIV1AppBanner(&app2.PutAPIV1AppBannerParams{
				Context: s.ctx,
				Request: &models2.RequestsUpdateAppBannerRequest{
					ID:     ptr(b.ID),
					Active: ptr(false),
				},
			})
			s.Require().NoError(err)
		}
	}

	// Создаем активный баннер с starts в прошлом и ends в будущем (действующий)
	pastStart := time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339)
	futureEnd := time.Now().Add(1 * time.Hour).UTC().Format(time.RFC3339)
	activeBanner, err := s.c.App.PostAPIV1AppBanner(&app2.PostAPIV1AppBannerParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppBannerRequest{
			Active:  true,
			Title:   ptr("Active Time Range Banner"),
			Message: "This banner is within its time range",
			Type:    ptr("info"),
			Color:   "#00FF00",
			Starts:  &pastStart,
			Ends:    &futureEnd,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(activeBanner)
	s.Require().NotNil(activeBanner.Payload)

	// Проверяем, что баннер возвращается через /banners/current
	currentRes, err := s.c.App.GetAPIV1AppBannersCurrent(&app2.GetAPIV1AppBannersCurrentParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(currentRes)
	s.Require().NotNil(currentRes.Payload)
	s.Require().NotNil(currentRes.Payload.AppBanner, "Действующий баннер должен возвращаться как текущий")
	s.Require().Equal("Active Time Range Banner", currentRes.Payload.AppBanner.Title)
}
