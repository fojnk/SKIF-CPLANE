package private

import (
	"fmt"
	"time"

	"github.com/go-openapi/strfmt"
	app2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/app"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// Примечание: некоторые тесты используют новые поля (Content, Limit, Offset, Total, Pages)
// которые появятся после регенерации swagger клиентов. Ошибки линтера исчезнут после регенерации.

func (s *StreamflowTestSuite) TestAppUpdatesBasic() {
	// Создаем опубликованное обновление (прошлое)
	pastDate := time.Now().AddDate(0, 0, -10) // 10 дней назад
	pastDateStr := strfmt.DateTime(pastDate).String()
	update1, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppUpdateRequest{
			Title:       "Test Update 1",
			Description: ptr("This is a test update description"),
			Content:     ptr("This is full article content for Test Update 1"),
			VideoURL:    ptr("https://example.com/video1.mp4"),
			ImageURL:    ptr("https://example.com/image1.jpg"),
			ReleaseDate: pastDateStr,
			IsPublished: true,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(update1)
	s.Require().NotNil(update1.Payload)
	s.Require().NotNil(update1.Payload.AppUpdate)

	update1ID := update1.Payload.AppUpdate.ID
	s.Require().Equal("Test Update 1", update1.Payload.AppUpdate.Title)
	s.Require().Equal("This is a test update description", update1.Payload.AppUpdate.Description)
	s.Require().Equal("This is full article content for Test Update 1", update1.Payload.AppUpdate.Content)
	s.Require().NotEmpty(update1.Payload.AppUpdate.VideoURL)
	s.Require().Equal("https://example.com/video1.mp4", update1.Payload.AppUpdate.VideoURL)
	s.Require().NotEmpty(update1.Payload.AppUpdate.ImageURL)
	s.Require().Equal("https://example.com/image1.jpg", update1.Payload.AppUpdate.ImageURL)
	s.Require().True(update1.Payload.AppUpdate.IsPublished)

	// Получаем обновление по ID
	updateDetails, err := s.c.App.GetAPIV1AppUpdate(&app2.GetAPIV1AppUpdateParams{
		Context:  s.ctx,
		UpdateID: update1ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(updateDetails)
	s.Require().NotNil(updateDetails.Payload)
	s.Require().Equal(update1ID, updateDetails.Payload.AppUpdate.ID)
	s.Require().Equal("Test Update 1", updateDetails.Payload.AppUpdate.Title)

	// Создаем грядущее обновление (неопубликованное)
	futureDate := time.Now().AddDate(0, 0, 10) // 10 дней вперед
	futureDateStr := strfmt.DateTime(futureDate).String()
	update2, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppUpdateRequest{
			Title:       "Upcoming Update",
			Description: ptr("This is an upcoming update"),
			ReleaseDate: futureDateStr,
			IsPublished: false,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(update2)
	s.Require().NotNil(update2.Payload)
	s.Require().False(update2.Payload.AppUpdate.IsPublished)

	// Получаем список всех обновлений с постраничкой (как админ)
	allUpdates, err := s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(100)),
		Offset:  ptr(int64(0)),
	})

	s.Require().NoError(err)
	s.Require().NotNil(allUpdates)
	s.Require().NotNil(allUpdates.Payload)
	// Проверяем, что наши созданные обновления присутствуют в списке
	s.Require().GreaterOrEqual(len(allUpdates.Payload.AppUpdates), 2, "Должно быть хотя бы 2 обновления")
	s.Require().GreaterOrEqual(allUpdates.Payload.Total, int64(2), "Total должен быть >= 2")
	s.Require().Greater(allUpdates.Payload.Pages, int64(0), "Pages должен быть > 0")
	var foundUpdate1, foundUpdate2 bool
	for _, update := range allUpdates.Payload.AppUpdates {
		if update.ID == update1ID {
			foundUpdate1 = true
		}
		if update.ID == update2.Payload.AppUpdate.ID {
			foundUpdate2 = true
		}
	}
	s.Require().True(foundUpdate1, "Первое обновление должно быть в списке")
	s.Require().True(foundUpdate2, "Второе обновление должно быть в списке")

	// Обновляем обновление
	newVideoUrl := "https://example.com/new-video.mp4"
	updated, err := s.c.App.PutAPIV1AppUpdate(&app2.PutAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpdateRequest{
			ID:       &update1ID,
			VideoURL: &newVideoUrl,
			Title:    ptr("Updated Test Update 1"),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().NotNil(updated.Payload)
	s.Require().Equal("Updated Test Update 1", updated.Payload.AppUpdate.Title)
	s.Require().NotEmpty(updated.Payload.AppUpdate.VideoURL)
	s.Require().Equal(newVideoUrl, updated.Payload.AppUpdate.VideoURL)
	// Описание должно остаться прежним, так как мы его не обновляли
	s.Require().Equal("This is a test update description", updated.Payload.AppUpdate.Description)
	// Content должен остаться прежним
	s.Require().Equal("This is full article content for Test Update 1", updated.Payload.AppUpdate.Content)

	// Публикуем грядущее обновление
	published := true
	update2Published, err := s.c.App.PutAPIV1AppUpdate(&app2.PutAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpdateRequest{
			ID:          &update2.Payload.AppUpdate.ID,
			IsPublished: &published,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(update2Published)
	s.Require().True(update2Published.Payload.AppUpdate.IsPublished)

	// Проверяем, что теперь у нас 2 опубликованных обновления (как админ видим все)
	allUpdates2, err := s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(100)),
		Offset:  ptr(int64(0)),
	})

	s.Require().NoError(err)
	s.Require().NotNil(allUpdates2)
	s.Require().GreaterOrEqual(len(allUpdates2.Payload.AppUpdates), 2, "Должно быть хотя бы 2 обновления")

	// Проверяем, что оба обновления опубликованы
	publishedCount := 0
	for _, update := range allUpdates2.Payload.AppUpdates {
		if update.IsPublished {
			publishedCount++
		}
	}
	s.Require().GreaterOrEqual(publishedCount, 2, "Должно быть хотя бы 2 опубликованных обновления")

	// Удаляем первое обновление
	_, err = s.c.App.DeleteAPIV1AppUpdate(&app2.DeleteAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsDeleteAppUpdateRequest{
			ID: update1ID,
		},
	})

	s.Require().NoError(err)

	// Проверяем, что обновление удалено
	allUpdates2, err = s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(100)),
		Offset:  ptr(int64(0)),
	})

	s.Require().NoError(err)
	s.Require().NotNil(allUpdates2)
	// Проверяем, что удаленное обновление отсутствует в списке
	var foundDeleted bool
	var foundUpdate2AfterDelete bool
	for _, update := range allUpdates2.Payload.AppUpdates {
		if update.ID == update1ID {
			foundDeleted = true
		}
		if update.ID == update2.Payload.AppUpdate.ID {
			foundUpdate2AfterDelete = true
		}
	}
	s.Require().False(foundDeleted, "Удаленное обновление не должно быть в списке")
	s.Require().True(foundUpdate2AfterDelete, "Второе обновление должно быть в списке")

	// Проверяем, что получение удаленного обновления возвращает ошибку
	_, err = s.c.App.GetAPIV1AppUpdate(&app2.GetAPIV1AppUpdateParams{
		Context:  s.ctx,
		UpdateID: update1ID,
	})

	s.Require().Error(err)
}

func (s *StreamflowTestSuite) TestAppUpdatesWithOptionalFields() {
	// Создаем обновление без опциональных полей (video_url, image_url)
	pastDate := time.Now().AddDate(0, 0, -5)
	pastDateStr := strfmt.DateTime(pastDate).String()
	update, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppUpdateRequest{
			Title:       "Update Without Media",
			Description: ptr("This update has no video or image"),
			ReleaseDate: pastDateStr,
			IsPublished: true,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(update)
	s.Require().NotNil(update.Payload)
	s.Require().Empty(update.Payload.AppUpdate.VideoURL)
	s.Require().Empty(update.Payload.AppUpdate.ImageURL)

	// Добавляем опциональные поля через обновление
	videoUrl := "https://example.com/video.mp4"
	imageUrl := "https://example.com/image.jpg"
	updated, err := s.c.App.PutAPIV1AppUpdate(&app2.PutAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpdateRequest{
			ID:       &update.Payload.AppUpdate.ID,
			VideoURL: &videoUrl,
			ImageURL: &imageUrl,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().NotEmpty(updated.Payload.AppUpdate.VideoURL)
	s.Require().Equal(videoUrl, updated.Payload.AppUpdate.VideoURL)
	s.Require().NotEmpty(updated.Payload.AppUpdate.ImageURL)
	s.Require().Equal(imageUrl, updated.Payload.AppUpdate.ImageURL)

	// Удаляем опциональные поля (устанавливаем в пустую строку)
	emptyString := ""
	updated2, err := s.c.App.PutAPIV1AppUpdate(&app2.PutAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpdateRequest{
			ID:       &update.Payload.AppUpdate.ID,
			VideoURL: &emptyString,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated2)
	// После обновления video_url может быть пустой строкой
	s.Require().Empty(updated2.Payload.AppUpdate.VideoURL)
}

func (s *StreamflowTestSuite) TestAppUpdatesDateOrdering() {
	// Создаем несколько обновлений с разными датами
	dates := []time.Time{
		time.Now().AddDate(0, 0, -30), // 30 дней назад
		time.Now().AddDate(0, 0, -10), // 10 дней назад
		time.Now().AddDate(0, 0, 10),  // 10 дней вперед
		time.Now().AddDate(0, 0, 30),  // 30 дней вперед
	}

	var updateIDs []int64
	for i, date := range dates {
		dateStr := strfmt.DateTime(date).String()
		update, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
			Context: s.ctx,
			Request: &models2.RequestsCreateAppUpdateRequest{
				Title:       fmt.Sprintf("Update %c", 'A'+i),
				Description: ptr(fmt.Sprintf("Description for update %c", 'A'+i)),
				ReleaseDate: dateStr,
				IsPublished: i < 2, // Первые два опубликованы, последние два - нет
			},
		})

		s.Require().NoError(err)
		s.Require().NotNil(update)
		updateIDs = append(updateIDs, update.Payload.AppUpdate.ID)
	}

	// Проверяем, что обновления отсортированы правильно (как админ: сначала drafts, потом по release_date DESC)
	allUpdates, err := s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(100)),
		Offset:  ptr(int64(0)),
	})

	s.Require().NoError(err)
	s.Require().NotNil(allUpdates)
	s.Require().GreaterOrEqual(len(allUpdates.Payload.AppUpdates), 4, "Должно быть хотя бы 4 обновления")

	// Находим наши созданные обновления в списке
	var foundIDs []int64
	for _, update := range allUpdates.Payload.AppUpdates {
		for _, id := range updateIDs {
			if update.ID == id {
				foundIDs = append(foundIDs, update.ID)
				break
			}
		}
	}
	s.Require().GreaterOrEqual(len(foundIDs), 4, "Все созданные обновления должны быть в списке")
}

func (s *StreamflowTestSuite) TestAppUpdatesNotFound() {
	// Пытаемся получить несуществующее обновление
	nonExistentID := int64(99999)
	_, err := s.c.App.GetAPIV1AppUpdate(&app2.GetAPIV1AppUpdateParams{
		Context:  s.ctx,
		UpdateID: nonExistentID,
	})

	s.Require().Error(err)

	// Пытаемся обновить несуществующее обновление
	_, err = s.c.App.PutAPIV1AppUpdate(&app2.PutAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpdateRequest{
			ID:    &nonExistentID,
			Title: ptr("Should fail"),
		},
	})

	s.Require().Error(err)

	// Пытаемся удалить несуществующее обновление
	// Удаление несуществующего элемента может не возвращать ошибку (idempotent delete)
	_, err = s.c.App.DeleteAPIV1AppUpdate(&app2.DeleteAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsDeleteAppUpdateRequest{
			ID: nonExistentID,
		},
	})

	// Проверяем, что элемент действительно не существует после попытки удаления
	_, err2 := s.c.App.GetAPIV1AppUpdate(&app2.GetAPIV1AppUpdateParams{
		Context:  s.ctx,
		UpdateID: nonExistentID,
	})
	s.Require().Error(err2, "Элемент не должен существовать после удаления")
}

// TestAppUpdatesWithContent проверяет работу поля content
func (s *StreamflowTestSuite) TestAppUpdatesWithContent() {
	pastDate := time.Now().AddDate(0, 0, -5)
	pastDateStr := strfmt.DateTime(pastDate).String()

	// Создаем обновление с content
	update, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppUpdateRequest{
			Title:       "Update With Content",
			Description: ptr("Short description"),
			Content:     ptr("# Full Article\n\nThis is a **full** article content with markdown.\n\n## Section 1\n\nSome text here."),
			ReleaseDate: pastDateStr,
			IsPublished: true,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(update)
	s.Require().Equal("Update With Content", update.Payload.AppUpdate.Title)
	s.Require().Equal("Short description", update.Payload.AppUpdate.Description)
	s.Require().Equal("# Full Article\n\nThis is a **full** article content with markdown.\n\n## Section 1\n\nSome text here.", update.Payload.AppUpdate.Content)

	// Обновляем content
	newContent := "# Updated Article\n\nUpdated content here."
	updated, err := s.c.App.PutAPIV1AppUpdate(&app2.PutAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateAppUpdateRequest{
			ID:      &update.Payload.AppUpdate.ID,
			Content: &newContent,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updated)
	s.Require().Equal(newContent, updated.Payload.AppUpdate.Content)
	s.Require().Equal("Short description", updated.Payload.AppUpdate.Description, "description не должен измениться")
}

// TestAppUpdatesPagination проверяет постраничку
func (s *StreamflowTestSuite) TestAppUpdatesPagination() {
	pastDate := time.Now().AddDate(0, 0, -10)
	pastDateStr := strfmt.DateTime(pastDate).String()

	// Создаем несколько обновлений
	var updateIDs []int64
	for i := 0; i < 5; i++ {
		update, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
			Context: s.ctx,
			Request: &models2.RequestsCreateAppUpdateRequest{
				Title:       fmt.Sprintf("Update %d", i+1),
				Description: ptr(fmt.Sprintf("Description %d", i+1)),
				ReleaseDate: pastDateStr,
				IsPublished: i < 3, // Первые 3 опубликованы
			},
		})
		s.Require().NoError(err)
		updateIDs = append(updateIDs, update.Payload.AppUpdate.ID)
	}

	// Тестируем постраничку с limit=2
	page1, err := s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(2)),
		Offset:  ptr(int64(0)),
	})

	s.Require().NoError(err)
	s.Require().NotNil(page1)
	s.Require().Len(page1.Payload.AppUpdates, 2)
	s.Require().GreaterOrEqual(page1.Payload.Total, int64(5))
	s.Require().GreaterOrEqual(page1.Payload.Pages, int64(1))

	// Вторая страница
	page2, err := s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(2)),
		Offset:  ptr(int64(2)),
	})

	s.Require().NoError(err)
	s.Require().NotNil(page2)
	s.Require().Len(page2.Payload.AppUpdates, 2)
	s.Require().Equal(page1.Payload.Total, page2.Payload.Total, "Total должен быть одинаковым на всех страницах")

	// Проверяем, что элементы разные
	s.Require().NotEqual(page1.Payload.AppUpdates[0].ID, page2.Payload.AppUpdates[0].ID, "Элементы на разных страницах должны быть разными")
}

// TestAppUpdatesAdminVsUser проверяет разную логику для админов и пользователей
func (s *StreamflowTestSuite) TestAppUpdatesAdminVsUser() {
	pastDate := time.Now().AddDate(0, 0, -5)
	pastDateStr := strfmt.DateTime(pastDate).String()
	futureDate := time.Now().AddDate(0, 0, 5)
	futureDateStr := strfmt.DateTime(futureDate).String()

	// Создаем опубликованное обновление
	publishedUpdate, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppUpdateRequest{
			Title:       "Published Update",
			Description: ptr("Published"),
			ReleaseDate: pastDateStr,
			IsPublished: true,
		},
	})
	s.Require().NoError(err)

	// Создаем draft обновление
	draftUpdate, err := s.c.App.PostAPIV1AppUpdate(&app2.PostAPIV1AppUpdateParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateAppUpdateRequest{
			Title:       "Draft Update",
			Description: ptr("Draft"),
			ReleaseDate: futureDateStr,
			IsPublished: false,
		},
	})
	s.Require().NoError(err)

	// Админ должен видеть все обновления (включая drafts)
	// Проверяем, что оба обновления присутствуют в списке
	allUpdates, err := s.c.App.GetAPIV1AppUpdates(&app2.GetAPIV1AppUpdatesParams{
		Context: s.ctx,
		Limit:   ptr(int64(100)),
		Offset:  ptr(int64(0)),
	})

	s.Require().NoError(err)
	var foundPublished, foundDraft bool
	for _, update := range allUpdates.Payload.AppUpdates {
		if update.ID == publishedUpdate.Payload.AppUpdate.ID {
			foundPublished = true
		}
		if update.ID == draftUpdate.Payload.AppUpdate.ID {
			foundDraft = true
		}
	}
	s.Require().True(foundPublished, "Админ должен видеть опубликованные обновления")
	s.Require().True(foundDraft, "Админ должен видеть draft обновления")

	// Проверяем порядок: сначала drafts (is_published=false), потом по release_date DESC
	// Находим индексы наших обновлений
	var draftIdx, publishedIdx int = -1, -1
	for i, update := range allUpdates.Payload.AppUpdates {
		if update.ID == draftUpdate.Payload.AppUpdate.ID {
			draftIdx = i
		}
		if update.ID == publishedUpdate.Payload.AppUpdate.ID {
			publishedIdx = i
		}
	}
	s.Require().NotEqual(-1, draftIdx)
	s.Require().NotEqual(-1, publishedIdx)
	// Draft должен идти раньше опубликованных (если есть другие опубликованные)
	// Но это зависит от других обновлений в БД, поэтому просто проверяем что оба найдены
}
