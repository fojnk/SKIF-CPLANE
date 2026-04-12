package permissionrequest

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

const idxPendingUnique = "idx_permission_request_pending_unique"

type Service struct {
	repo *repository.Repository
}

func NewService(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

var allowedObjectTypes = map[string]struct{}{
	string(acl.Namespace):  {},
	string(acl.Project):    {},
	string(acl.Experiment): {},
	string(acl.Dataset):    {},
	string(acl.Cube):       {},
}

var allowedActions = map[string]struct{}{
	string(acl.Read):   {},
	string(acl.Edit):   {},
	string(acl.Create): {},
	string(acl.Delete): {},
}

func (s *Service) CreatePermissionRequest(ctx context.Context, username string, r *requests.CreatePermissionRequest) (*responses.PermissionRequestItem, error) {
	ot := strings.TrimSpace(r.ObjectType)
	if _, ok := allowedObjectTypes[ot]; !ok {
		return nil, serviceerrors.NewBadRequestError("Недопустимый тип объекта", nil)
	}
	action := strings.TrimSpace(r.Action)
	if action == "" {
		action = string(acl.Read)
	}
	if _, ok := allowedActions[action]; !ok {
		return nil, serviceerrors.NewBadRequestError("Недопустимое действие (action)", nil)
	}
	attr := strings.TrimSpace(r.ObjectAttribute)
	if attr == "" {
		attr = string(acl.MetaAttribute)
	}

	u, err := s.repo.DB.GetUserInfoByName(ctx, username)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, serviceerrors.NewNotFoundError("Пользователь не найден", err)
		}
		s.repo.Logger.Error("get user for permission request", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить пользователя", err)
	}

	row, err := s.repo.DB.InsertPermissionRequest(ctx, dbcore.InsertPermissionRequestParams{
		RequesterUserID: u.ID,
		ObjectType:      ot,
		ObjectID:        r.ObjectID,
		ObjectAttribute: attr,
		Action:          action,
		Message:         strings.TrimSpace(r.Message),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == serviceerrors.UniqueConstraintViolationCode && pgErr.ConstraintName == idxPendingUnique {
			return nil, serviceerrors.NewConflictError("Заявка с такими параметрами уже ожидает рассмотрения", err)
		}
		s.repo.Logger.Error("insert permission request", err)
		return nil, serviceerrors.NewInternalError("Не удалось создать заявку", err)
	}

	return mapTPermissionRequestToItem(row, username, u.Email), nil
}

func (s *Service) ListMyPermissionRequests(ctx context.Context, username string) ([]responses.PermissionRequestItem, error) {
	u, err := s.repo.DB.GetUserInfoByName(ctx, username)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, serviceerrors.NewNotFoundError("Пользователь не найден", err)
		}
		return nil, serviceerrors.NewInternalError("Не удалось получить пользователя", err)
	}

	rows, err := s.repo.DB.ListMyPermissionRequests(ctx, u.ID)
	if err != nil {
		s.repo.Logger.Error("list my permission requests", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить заявки", err)
	}
	out := make([]responses.PermissionRequestItem, 0, len(rows))
	for _, row := range rows {
		out = append(out, *mapTPermissionRequestToItem(row, username, u.Email))
	}
	return out, nil
}

func (s *Service) ListPermissionRequestsForAdmin(ctx context.Context, r *requests.ListPermissionRequestsAdminRequest) ([]responses.PermissionRequestItem, int64, error) {
	limit := r.Limit
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	offset := r.Offset
	if offset < 0 {
		offset = 0
	}
	st := strings.TrimSpace(r.Status)
	var sf pgtype.Text
	if st != "" && st != "all" {
		sf = pgtype.Text{String: st, Valid: true}
	}

	total, err := s.repo.DB.CountPermissionRequestsForAdmin(ctx, sf)
	if err != nil {
		s.repo.Logger.Error("count permission requests", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось посчитать заявки", err)
	}

	rows, err := s.repo.DB.ListPermissionRequestsForAdmin(ctx, dbcore.ListPermissionRequestsForAdminParams{
		Limit:        limit,
		Offset:       offset,
		StatusFilter: sf,
	})
	if err != nil {
		s.repo.Logger.Error("list permission requests for admin", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось получить заявки", err)
	}

	out := make([]responses.PermissionRequestItem, 0, len(rows))
	for _, row := range rows {
		var emailPtr *string
		if row.RequesterEmail.Valid {
			e := row.RequesterEmail.String
			emailPtr = &e
		}
		item := responses.PermissionRequestItem{
			ID:              row.ID,
			RequesterUserID: row.RequesterUserID,
			RequesterName:   row.RequesterName,
			RequesterEmail:  emailPtr,
			ObjectType:      row.ObjectType,
			ObjectID:        row.ObjectID,
			ObjectAttribute: row.ObjectAttribute,
			Action:          row.Action,
			Message:         row.Message,
			Status:          row.Status,
			CreatedAt:       timestampFromPg(row.CreatedAt),
		}
		if row.ReviewerUserID.Valid {
			v := row.ReviewerUserID.Int32
			item.ReviewerUserID = &v
		}
		if row.ReviewedAt.Valid {
			t := row.ReviewedAt.Time
			item.ReviewedAt = &t
		}
		out = append(out, item)
	}
	return out, total, nil
}

func (s *Service) ApprovePermissionRequest(ctx context.Context, id int32, reviewerUsername string) error {
	reviewer, err := s.repo.DB.GetUserInfoByName(ctx, reviewerUsername)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return serviceerrors.NewNotFoundError("Пользователь-ревьюер не найден", err)
		}
		return serviceerrors.NewInternalError("Не удалось получить ревьюера", err)
	}

	pr, err := s.repo.DB.GetPermissionRequestByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return serviceerrors.NewNotFoundError("Заявка не найдена", err)
		}
		return serviceerrors.NewInternalError("Не удалось получить заявку", err)
	}
	if pr.Status != "pending" {
		return serviceerrors.NewConflictError("Заявка уже обработана", nil)
	}

	ruleID, err := findOrCreateRule(ctx, s.repo.DB, pr.ObjectType, pr.ObjectAttribute, pr.Action, pr.ObjectID)
	if err != nil {
		return err
	}

	err = s.repo.DB.GrantUserRule(ctx, dbcore.GrantUserRuleParams{
		UserID: pgtype.Int4{Int32: pr.RequesterUserID, Valid: true},
		RuleID: pgtype.Int4{Int32: ruleID, Valid: true},
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == serviceerrors.UniqueConstraintViolationCode {
			// уже выдано то же правило
		} else {
			s.repo.Logger.Error("grant user rule from permission request", err)
			return serviceerrors.NewInternalError("Не удалось выдать правило", err)
		}
	}

	_, err = s.repo.DB.UpdatePermissionRequestReviewed(ctx, dbcore.UpdatePermissionRequestReviewedParams{
		ID:             id,
		Status:         "approved",
		ReviewerUserID: pgtype.Int4{Int32: reviewer.ID, Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return serviceerrors.NewConflictError("Заявка уже обработана", err)
		}
		return serviceerrors.NewInternalError("Не удалось обновить заявку", err)
	}
	return nil
}

func (s *Service) RejectPermissionRequest(ctx context.Context, id int32, reviewerUsername string) error {
	reviewer, err := s.repo.DB.GetUserInfoByName(ctx, reviewerUsername)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return serviceerrors.NewNotFoundError("Пользователь-ревьюер не найден", err)
		}
		return serviceerrors.NewInternalError("Не удалось получить ревьюера", err)
	}

	_, err = s.repo.DB.UpdatePermissionRequestReviewed(ctx, dbcore.UpdatePermissionRequestReviewedParams{
		ID:             id,
		Status:         "rejected",
		ReviewerUserID: pgtype.Int4{Int32: reviewer.ID, Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return serviceerrors.NewConflictError("Заявка не найдена или уже обработана", err)
		}
		return serviceerrors.NewInternalError("Не удалось отклонить заявку", err)
	}
	return nil
}

func findOrCreateRule(ctx context.Context, q dbcore.Querier, objectType, objectAttribute, action string, objectID int32) (int32, error) {
	rid, err := q.SelectRuleIDByExactMatch(ctx, dbcore.SelectRuleIDByExactMatchParams{
		ObjectType:      objectType,
		ObjectAttribute: objectAttribute,
		ObjectID:        objectID,
		Action:          action,
	})
	if err == nil {
		return rid, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return 0, serviceerrors.NewInternalError("Не удалось найти правило", err)
	}
	return q.InsertRule(ctx, dbcore.InsertRuleParams{
		ObjectType:      objectType,
		ObjectAttribute: objectAttribute,
		ObjectID:        objectID,
		Action:          action,
	})
}

func mapTPermissionRequestToItem(row dbcore.TPermissionRequest, requesterName string, email pgtype.Text) *responses.PermissionRequestItem {
	item := &responses.PermissionRequestItem{
		ID:              row.ID,
		RequesterUserID: row.RequesterUserID,
		RequesterName:   requesterName,
		ObjectType:      row.ObjectType,
		ObjectID:        row.ObjectID,
		ObjectAttribute: row.ObjectAttribute,
		Action:          row.Action,
		Message:         row.Message,
		Status:          row.Status,
		CreatedAt:       timestampFromPg(row.CreatedAt),
	}
	if email.Valid {
		s := email.String
		item.RequesterEmail = &s
	}
	if row.ReviewerUserID.Valid {
		v := row.ReviewerUserID.Int32
		item.ReviewerUserID = &v
	}
	if row.ReviewedAt.Valid {
		t := row.ReviewedAt.Time
		item.ReviewedAt = &t
	}
	return item
}

func timestampFromPg(t pgtype.Timestamp) time.Time {
	if !t.Valid {
		return time.Time{}
	}
	return t.Time
}
