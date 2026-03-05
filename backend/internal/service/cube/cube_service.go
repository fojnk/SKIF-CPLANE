package cube

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type CubeService struct {
	repo *repository.Repository
}

func NewCubeService(repo *repository.Repository) *CubeService {
	return &CubeService{repo: repo}
}

func (s *CubeService) CreateCube(ctx context.Context, cube *dto.Cube) (*dto.Cube, error) {
	if len(cube.ParamsName) == 0 {
		cube.ParamsName = fmt.Sprintf("%sParams", cube.Name)
	}

	if len(cube.Params) == 0 {
		cube.Params = "{}"
	}

	if len(cube.Type) == 0 {
		cube.Type = dto.CubeT
	}

	insertedCube, err := s.repo.DB.InsertCube(ctx, dbcore.InsertCubeParams{
		Name:        cube.Name,
		Author:      cube.Author,
		Description: cube.Description,
		BaseID:      pgtype.Int4{Valid: false},
		ParamsName:  cube.ParamsName,
		Params:      []byte(cube.Params),
		Type:        string(cube.Type),
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert cube", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityCube)
	}

	return &dto.Cube{
		ID:          insertedCube.ID,
		Name:        insertedCube.Name,
		Author:      insertedCube.Author,
		Description: insertedCube.Description,
		ParamsName:  insertedCube.ParamsName,
		Params:      string(insertedCube.Params),
		Type:        cube.Type,
	}, nil
}

func (s *CubeService) UpdateCube(ctx context.Context, cube *dto.Cube) (*dto.Cube, error) {
	if len(cube.ParamsName) == 0 {
		cube.ParamsName = fmt.Sprintf("%sParams", cube.Name)
	}

	if len(cube.Params) == 0 {
		cube.Params = "{}"
	}

	if len(cube.Type) == 0 {
		cube.Type = dto.CubeT
	}

	updatedCube, err := s.repo.DB.UpdateCube(ctx, dbcore.UpdateCubeParams{
		ID:          cube.ID,
		Name:        cube.Name,
		Description: cube.Description,
		ParamsName:  cube.ParamsName,
		Params:      []byte(cube.Params),
		Type:        string(cube.Type),
	})
	if err != nil {
		s.repo.Logger.Error("failed to update cube", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityCube)
	}

	return &dto.Cube{
		ID:          updatedCube.ID,
		Name:        updatedCube.Name,
		Author:      updatedCube.Author,
		Description: updatedCube.Description,
		ParamsName:  updatedCube.ParamsName,
		Params:      string(updatedCube.Params),
		Type:        cube.Type,
	}, nil
}

func (s *CubeService) ListCubes(ctx context.Context) ([]dto.Cube, error) {
	cubes, err := s.repo.DB.SelectCubes(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to select cubes", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityCube)
	}

	cubesList := make([]dto.Cube, 0, len(cubes))
	for _, c := range cubes {
		cubesList = append(cubesList, dto.Cube{
			ID:          c.ID,
			Name:        c.Name,
			Author:      c.Author,
			Description: c.Description,
			ParamsName:  c.ParamsName,
			Params:      string(c.Params),
			Type:        dto.CubeType(c.Type),
		})
	}

	return cubesList, err
}

func (s *CubeService) ListCubesByIDs(ctx context.Context, ids []int32) ([]dto.Cube, error) {
	cubes, err := s.repo.DB.SelectCubesByIDs(ctx, ids)
	if err != nil {
		s.repo.Logger.Error("failed to select cubes by ids", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityCube)
	}

	cubesSl := make([]dto.Cube, 0, len(cubes))
	for _, c := range cubes {
		cubesSl = append(cubesSl, dto.Cube{
			ID:          c.ID,
			Name:        c.Name,
			Author:      c.Author,
			Description: c.Description,
			ParamsName:  c.ParamsName,
			Params:      string(c.Params),
			Type:        dto.CubeType(c.Type),
		})
	}

	return cubesSl, err
}

func (s *CubeService) GetCubeByName(ctx context.Context, name string) (*dto.Cube, error) {
	cube, err := s.repo.DB.SelectCubeByName(ctx, name)
	if err != nil {
		s.repo.Logger.Error("failed to select cube", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityCube)
	}

	return &dto.Cube{
		ID:          cube.ID,
		Name:        cube.Name,
		Author:      cube.Author,
		Description: cube.Description,
		ParamsName:  cube.ParamsName,
		Params:      string(cube.Params),
		Type:        dto.CubeType(cube.Type),
	}, nil
}

func (s *CubeService) GetCubeByID(ctx context.Context, ID int32) (*dto.Cube, error) {
	cube, err := s.repo.DB.SelectCubeByID(ctx, ID)
	if err != nil {
		s.repo.Logger.Error("failed to select cube", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityCube)
	}

	return &dto.Cube{
		ID:          cube.ID,
		Name:        cube.Name,
		Author:      cube.Author,
		Description: cube.Description,
		ParamsName:  cube.ParamsName,
		Params:      string(cube.Params),
		Type:        dto.CubeType(cube.Type),
	}, nil
}
