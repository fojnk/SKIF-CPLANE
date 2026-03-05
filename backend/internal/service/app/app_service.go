package service

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type AppService struct {
	repo *repository.Repository
}

func NewAppService(repo *repository.Repository) *AppService {
	return &AppService{repo: repo}
}

func (s *AppService) CreateAppBanner(ctx context.Context, title, message, color, colorDark, bannerType string, active bool, starts, ends *time.Time) (int32, error) {
	var startsPg, endsPg pgtype.Timestamp
	if starts != nil {
		startsPg = pgtype.Timestamp{Time: *starts, Valid: true}
	}
	if ends != nil {
		endsPg = pgtype.Timestamp{Time: *ends, Valid: true}
	}

	appBannerID, err := s.repo.DB.InsertAppBanner(ctx, dbcore.InsertAppBannerParams{
		Title:     title,
		Message:   message,
		Active:    active,
		Color:     color,
		ColorDark: colorDark,
		Type:      bannerType,
		Starts:    startsPg,
		Ends:      endsPg,
	})
	if err != nil {
		return 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
	}

	// Если создается активный баннер, деактивируем все остальные
	if active {
		err = s.repo.DB.DeactivateAllBannersExcept(ctx, appBannerID)
		if err != nil {
			return 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
		}
	}

	return appBannerID, nil
}

func (s *AppService) UpdateAppBanner(ctx context.Context, bannerID int32, title, message, color, colorDark string, bannerType *string, active *bool, starts, ends *time.Time) (*dto.AppBanner, error) {
	var startsPg, endsPg pgtype.Timestamp
	if starts != nil {
		startsPg = pgtype.Timestamp{Time: *starts, Valid: true}
	}
	if ends != nil {
		endsPg = pgtype.Timestamp{Time: *ends, Valid: true}
	}

	updated, err := s.repo.DB.UpdateAppBanner(ctx, dbcore.UpdateAppBannerParams{
		ID:        bannerID,
		Title:     title,
		Type:      bannerType,
		Message:   message,
		Color:     color,
		ColorDark: colorDark,
		Active:    active,
		Starts:    startsPg,
		Ends:      endsPg,
	})
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
	}

	// Если баннер активируется, деактивируем все остальные
	if active != nil && *active {
		err = s.repo.DB.DeactivateAllBannersExcept(ctx, bannerID)
		if err != nil {
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
		}
		// Обновляем статус в возвращаемом объекте
		updated.Active = true
	}

	return convertDBBannerToDTO(updated), nil
}

func (s *AppService) DeleteAppBanner(ctx context.Context, bannerID int32) error {
	err := s.repo.DB.DeleteAppBanner(ctx, bannerID)
	if err != nil {
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
	}

	return nil
}

func (s *AppService) ListAppBanners(ctx context.Context) ([]dto.AppBanner, error) {
	banners, err := s.repo.DB.SelectAppBanners(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to list app banners", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить список баннеров", err)
	}

	result := make([]dto.AppBanner, len(banners))
	for i, banner := range banners {
		result[i] = *convertDBBannerToDTO(banner)
	}

	return result, nil
}

// GetAppBanner возвращает баннер по ID
func (s *AppService) GetAppBanner(ctx context.Context, bannerID int32) (*dto.AppBanner, error) {
	banner, err := s.repo.DB.SelectAppBanner(ctx, bannerID)
	if err != nil {
		s.repo.Logger.Error("failed to get app banner", err)
		return nil, serviceerrors.NewNotFoundError("Баннер не найден", err)
	}

	return convertDBBannerToDTO(banner), nil
}

func (s *AppService) GetAvailableBannerTypes() []dto.BannerType {
	return []dto.BannerType{
		dto.BannerTypeInfo,
		dto.BannerTypeReleaseBlock,
		dto.BannerTypeWarning,
	}
}

func (s *AppService) IsExistsActiveBlockBanners(ctx context.Context) (bool, error) {
	isBlocked, err := s.repo.DB.IsExistsActiveBlockBanners(ctx)
	if err != nil {
		return false, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
	}
	if isBlocked == nil {
		return false, serviceerrors.NewInternalError("Результат проверки блокирующих баннеров равен nil", nil)
	}

	return *isBlocked, nil
}

func (s *AppService) GetActiveAppBanner(ctx context.Context) (*dto.AppBanner, error) {
	banner, err := s.repo.DB.SelectActiveAppBanner(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
	}

	return convertDBBannerToDTO(banner), nil
}

func (s *AppService) GetCurrentAppBanner(ctx context.Context) (*dto.AppBanner, error) {
	banner, err := s.repo.DB.SelectCurrentAppBanner(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppBanner)
	}

	return convertDBBannerToDTO(banner), nil
}

func convertDBBannerToDTO(banner dbcore.TAppBanner) *dto.AppBanner {
	var starts, ends *time.Time
	if banner.Starts.Valid {
		starts = &banner.Starts.Time
	}
	if banner.Ends.Valid {
		ends = &banner.Ends.Time
	}

	var createdAt, updatedAt time.Time
	if banner.CreatedAt.Valid {
		createdAt = banner.CreatedAt.Time
	}
	if banner.UpdatedAt.Valid {
		updatedAt = banner.UpdatedAt.Time
	}

	return &dto.AppBanner{
		Id:        banner.ID,
		Title:     banner.Title,
		Message:   banner.Message,
		Color:     banner.Color,
		ColorDark: banner.ColorDark,
		Active:    banner.Active,
		Type:      banner.Type,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		Starts:    starts,
		Ends:      ends,
	}
}

func (s *AppService) CreateAppUpdate(ctx context.Context, title, description, content string, videoUrl, imageUrl *string, releaseDate time.Time, isPublished bool) (*dto.AppUpdate, error) {
	var videoUrlPg pgtype.Text
	if videoUrl != nil {
		videoUrlPg = pgtype.Text{String: *videoUrl, Valid: true}
	}

	var imageUrlPg pgtype.Text
	if imageUrl != nil {
		imageUrlPg = pgtype.Text{String: *imageUrl, Valid: true}
	}

	releaseDatePg := pgtype.Timestamp{Time: releaseDate, Valid: true}

	update, err := s.repo.DB.InsertAppUpdate(ctx, dbcore.InsertAppUpdateParams{
		Title:       title,
		Description: description,
		Content:     content,
		VideoUrl:    videoUrlPg,
		ImageUrl:    imageUrlPg,
		ReleaseDate: releaseDatePg,
		IsPublished: isPublished,
	})
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpdate)
	}

	return convertDBUpdateToDTO(update), nil
}

// UpdateAppUpdate обновляет обновление приложения
func (s *AppService) UpdateAppUpdate(ctx context.Context, updateID int32, title, description, content string, videoUrl, imageUrl *string, releaseDate *time.Time, isPublished *bool) (*dto.AppUpdate, error) {
	var videoUrlStr string
	if videoUrl != nil {
		videoUrlStr = *videoUrl
	}

	var imageUrlStr string
	if imageUrl != nil {
		imageUrlStr = *imageUrl
	}

	var releaseDatePg pgtype.Timestamp
	if releaseDate != nil {
		releaseDatePg = pgtype.Timestamp{Time: *releaseDate, Valid: true}
	}

	updated, err := s.repo.DB.UpdateAppUpdate(ctx, dbcore.UpdateAppUpdateParams{
		ID:          updateID,
		Title:       title,
		Description: description,
		Content:     content,
		VideoUrl:    videoUrlStr,
		ImageUrl:    imageUrlStr,
		ReleaseDate: releaseDatePg,
		IsPublished: isPublished,
	})
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpdate)
	}

	return convertDBUpdateToDTO(updated), nil
}

func (s *AppService) DeleteAppUpdate(ctx context.Context, updateID int32) error {
	err := s.repo.DB.DeleteAppUpdate(ctx, updateID)
	if err != nil {
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpdate)
	}

	return nil
}

func (s *AppService) ListAppUpdates(ctx context.Context, isAdmin bool, limit int32, offset int32) ([]dto.AppUpdate, int64, error) {
	// Устанавливаем значения по умолчанию
	if limit <= 0 {
		limit = 20
	}

	if offset < 0 {
		offset = 0
	}

	isAdminPtr := &isAdmin
	updates, err := s.repo.DB.SelectAppUpdatesPaginated(ctx, dbcore.SelectAppUpdatesPaginatedParams{
		Column1: isAdminPtr,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return nil, 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpdate)
	}

	total, err := s.repo.DB.CountAppUpdatesPaginated(ctx, isAdminPtr)
	if err != nil {
		return nil, 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpdate)
	}

	result := make([]dto.AppUpdate, len(updates))
	for i, update := range updates {
		result[i] = *convertDBUpdateToDTO(update)
	}

	return result, total, nil
}

func (s *AppService) GetAppUpdate(ctx context.Context, updateID int32) (*dto.AppUpdate, error) {
	update, err := s.repo.DB.SelectAppUpdate(ctx, updateID)
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpdate)
	}

	return convertDBUpdateToDTO(update), nil
}

func convertDBUpdateToDTO(update dbcore.TAppUpdate) *dto.AppUpdate {
	var videoUrl, imageUrl *string
	if update.VideoUrl.Valid {
		videoUrl = &update.VideoUrl.String
	}
	if update.ImageUrl.Valid {
		imageUrl = &update.ImageUrl.String
	}

	var createdAt, updatedAt time.Time
	if update.CreatedAt.Valid {
		createdAt = update.CreatedAt.Time
	}
	if update.UpdatedAt.Valid {
		updatedAt = update.UpdatedAt.Time
	}

	// release_date is NOT NULL, so it should always be valid
	releaseDate := update.ReleaseDate.Time

	return &dto.AppUpdate{
		Id:          update.ID,
		Title:       update.Title,
		Description: update.Description,
		Content:     update.Content,
		VideoUrl:    videoUrl,
		ImageUrl:    imageUrl,
		ReleaseDate: releaseDate,
		IsPublished: update.IsPublished,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}

func (s *AppService) GetAppUpcoming(ctx context.Context) (*dto.AppUpcoming, error) {
	upcoming, err := s.repo.DB.SelectAppUpcoming(ctx)
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpcoming)
	}

	var updatedAt time.Time
	if upcoming.UpdatedAt.Valid {
		updatedAt = upcoming.UpdatedAt.Time
	}

	return &dto.AppUpcoming{
		Content:   upcoming.Content,
		UpdatedAt: updatedAt,
	}, nil
}

func (s *AppService) UpdateAppUpcoming(ctx context.Context, content string) (*dto.AppUpcoming, error) {
	updated, err := s.repo.DB.UpdateAppUpcoming(ctx, content)
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppUpcoming)
	}

	var updatedAt time.Time
	if updated.UpdatedAt.Valid {
		updatedAt = updated.UpdatedAt.Time
	}

	return &dto.AppUpcoming{
		Content:   updated.Content,
		UpdatedAt: updatedAt,
	}, nil
}

func (s *AppService) GetAppAbout(ctx context.Context) (*dto.AppAbout, error) {
	about, err := s.repo.DB.SelectAppAbout(ctx)
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppAbout)
	}

	var updatedAt time.Time
	if about.UpdatedAt.Valid {
		updatedAt = about.UpdatedAt.Time
	}

	return &dto.AppAbout{
		Content:   about.Content,
		Links:     about.Links,
		UpdatedAt: updatedAt,
	}, nil
}

func (s *AppService) UpdateAppAbout(ctx context.Context, content, links *string) (*dto.AppAbout, error) {
	updated, err := s.repo.DB.UpdateAppAbout(ctx, dbcore.UpdateAppAboutParams{
		Content: content,
		Links:   links,
	})
	if err != nil {
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityAppAbout)
	}

	var updatedAt time.Time
	if updated.UpdatedAt.Valid {
		updatedAt = updated.UpdatedAt.Time
	}

	return &dto.AppAbout{
		Content:   updated.Content,
		Links:     updated.Links,
		UpdatedAt: updatedAt,
	}, nil
}
