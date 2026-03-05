package private

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// createSystemCube godoc
//
//	@Summary	create system cube
//	@Tags 		cube
//	@Accept 	json
//	@Produce 	json
//	@Param 		request body		requests.CreateCubeRequest	true	"request body"
//	@Success	200 	{object}	responses.CreateCubeResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409		{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/cube/system [post]
func createSystemCube(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateCubeRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Cube, acl.CubeAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	createdCube, err := svc.ICubeService.CreateCube(ctx, &dto.Cube{
		Name:        r.Name,
		Author:      u.Username,
		Description: r.Description,
		ParamsName:  r.ParamsName,
		Params:      r.Params,
		Type:        dto.CubeType(r.Type),
	})
	if err != nil {
		l.Error("failed to create cube", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCube)
	}

	return responses.CreateCubeResponse{
		Cube: dto.Cube{
			ID:          createdCube.ID,
			Name:        createdCube.Name,
			Author:      createdCube.Author,
			Description: createdCube.Description,
			ParamsName:  createdCube.ParamsName,
			Params:      createdCube.Params,
			Type:        createdCube.Type,
		},
	}, nil
}

// func createSystemCubesByJsonSchema(ctx context.Context, repo *repository.Repository, l *logger.Logger, r *requests.CreateSystemCubesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
// 	if err := shared.CheckPermission(ctx, l, repo, acl.Cube, acl.CubeAttribute, acl.Create, 0, u); err != nil {
// 		return nil, err
// 	}

// 	/*
// 		вставить несуществующие кубы
// 		обновить существующие
// 		политика ошибок ? (обновить все или отклонить)
// 	*/

// 	return nil, nil // slice of added cubes
// }

// func validateSystemCubesByJsonSchema(ctx context.Context, repo *repository.Repository, l *logger.Logger, r *requests.CreateSystemCubesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
// 	if err := shared.CheckPermission(ctx, l, repo, acl.Cube, acl.CubeAttribute, acl.Create, 0, u); err != nil {
// 		return nil, err
// 	}

// 	return nil, nil // errors of validation for cubes or success
// }

// listCubes godoc
//
//	@Summary    get list of cubes
//	@Tags 		cube
//	@Produce 	json
//	@Success	200 	{object}	responses.ListCubesResponse
//	@Router		/api/v1/cubes [get]
func listCubes(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListCubesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	cubes, err := svc.ICubeService.ListCubes(ctx)
	if err != nil {
		l.Error("failed to list cubes", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCube)
	}

	return responses.ListCubesResponse{
		Cubes: cubes,
	}, nil
}

// listCubesByIDs godoc
//
//	@Summary    get list of cubes by provided ids
//	@Tags 		cube
//	@Param		ids	query	[]int	true	"cubes ids"
//	@Produce 	json
//	@Success	200 	{object}	responses.ListCubesResponse
//	@Router		/api/v1/cubes/by_ids [get]
func listCubesByIDs(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListCubesByIDsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	cubes, err := svc.ICubeService.ListCubesByIDs(ctx, r.IDs)
	if err != nil {
		l.Error("failed to list cubes", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCube)
	}

	return responses.ListCubesResponse{
		Cubes: cubes,
	}, nil
}

// getCubeByID godoc
//
//	@Summary	get cube
//	@Tags 		cube
//	@Param		cube_id	query	int	true	"cube id"
//	@Produce 	json
//	@Success	200 	{object}	responses.GetCubeResponse
//	@Router		/api/v1/cube [get]
func getCubeByID(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetCubeRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	cube, err := svc.ICubeService.GetCubeByID(ctx, r.CubeID)
	if err != nil {
		l.Error("failed to get cube by id", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCube)
	}

	return responses.GetCubeResponse{
		Cube: dto.Cube{
			ID:          cube.ID,
			Name:        cube.Name,
			Author:      cube.Author,
			Description: cube.Description,
			ParamsName:  cube.ParamsName,
			Params:      cube.Params,
			Type:        cube.Type,
		},
	}, nil
}

// getCubeByName godoc
//
//	@Summary	get cube by name
//	@Tags 		cube
//	@Param		name	query	string	true	"cube name"
//	@Produce 	json
//	@Success	200 	{object}	responses.GetCubeResponse
//	@Router		/api/v1/cube/name [get]
func getCubeByName(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetCubeByNameRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	cube, err := svc.ICubeService.GetCubeByName(ctx, r.Name)
	if err != nil {
		l.Error("failed to get cube by id", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCube)
	}

	return responses.GetCubeResponse{
		Cube: dto.Cube{
			ID:          cube.ID,
			Name:        cube.Name,
			Author:      cube.Author,
			Description: cube.Description,
			ParamsName:  cube.ParamsName,
			Params:      cube.Params,
			Type:        cube.Type,
		},
	}, nil
}

// updateCube godoc
//
//	@Summary	update cube
//	@Tags 		cube
//	@Accept 	json
//	@Produce 	json
//	@Param 		request body		requests.UpdateCubeRequest	true	"request body"
//	@Success	200 	{object}	responses.UpdateCubeResponse
//	@Router		/api/v1/cube [put]
func updateCube(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateCubeRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Cube, acl.CubeAttribute, acl.Edit, r.ID, u); err != nil {
		return nil, err
	}

	updatedCube, err := svc.ICubeService.UpdateCube(ctx, &dto.Cube{
		ID:          r.ID,
		Name:        r.Name,
		Description: r.Description,
		ParamsName:  r.ParamsName,
		Params:      r.Params,
		Type:        dto.CubeType(r.Type),
	})
	if err != nil {
		l.Error("failed to update cube", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCube)
	}

	return responses.UpdateCubeResponse{
		Cube: dto.Cube{
			ID:          updatedCube.ID,
			Name:        updatedCube.Name,
			Author:      updatedCube.Author,
			Description: updatedCube.Description,
			ParamsName:  updatedCube.ParamsName,
			Params:      updatedCube.Params,
			Type:        updatedCube.Type,
		},
	}, nil
}
