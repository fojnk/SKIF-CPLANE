package private

import (
	"slices"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/cube"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestCube() {
	// grant rule for working with system cubes
	s.grantCubeSystem()

	// create system cube
	createRes, err := s.c.Cube.PostAPIV1CubeSystem(&cube.PostAPIV1CubeSystemParams{
		Request: &models2.RequestsCreateCubeRequest{
			Name:        ptr("TestCube"),
			Description: "test cube description",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(createRes)
	s.Require().NotNil(createRes.Payload)
	s.Require().Equal("TestCube", createRes.Payload.Name)
	s.Require().Equal("test cube description", createRes.Payload.Description)
	s.Require().Equal(models.DtoCubeType("CIT_CUBE"), createRes.Payload.Type)
	s.Require().Equal(testUserName, createRes.Payload.Author)
	// get cube by id
	getRes, err := s.c.Cube.GetAPIV1Cube(&cube.GetAPIV1CubeParams{
		CubeID: createRes.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal(createRes.Payload.ID, getRes.Payload.ID)
	// get cube by name
	getByNameRes, err := s.c.Cube.GetAPIV1CubeName(&cube.GetAPIV1CubeNameParams{
		Name: "TestCube",
	})
	s.Require().NoError(err)
	s.Require().NotNil(getByNameRes)
	s.Require().NotNil(getByNameRes.Payload)
	s.Require().Equal(getByNameRes.Payload.ID, getRes.Payload.ID)
	s.Require().Equal(getByNameRes.Payload.Name, getRes.Payload.Name)

	testCubeParams := `
{
	"args": [
		{
			"name": "test",
			"type": {
				"type": "string"
			},
			"required": true
		}
	],
	"inputs": {
		"type": "static",
		"list_names": ["test1", "test2"]
	},
	"outputs": {
		"type": "dynamic"
	}

}`
	// update cube
	updateRes, err := s.c.Cube.PutAPIV1Cube(&cube.PutAPIV1CubeParams{
		Request: &models2.RequestsUpdateCubeRequest{
			ID:          &createRes.Payload.ID,
			Name:        ptr("ATestCube"),
			Description: "test cube description updated",
			ParamsName:  "TestCubeParamsName",
			CubeParams:  testCubeParams,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)
	s.Require().Equal("ATestCube", updateRes.Payload.Name)
	s.Require().Equal("test cube description updated", updateRes.Payload.Description)
	s.Require().Equal("TestCubeParamsName", updateRes.Payload.ParamsName)
	s.Require().JSONEq(testCubeParams, updateRes.Payload.CubeParams)
	// create second cube
	createRes2, err := s.c.Cube.PostAPIV1CubeSystem(&cube.PostAPIV1CubeSystemParams{
		Request: &models2.RequestsCreateCubeRequest{
			Name:        ptr("BTestCube"),
			Description: "test cube description 2",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(createRes2)
	s.Require().NotNil(createRes2.Payload)
	s.Require().Equal("BTestCube", createRes2.Payload.Name)
	s.Require().Equal("test cube description 2", createRes2.Payload.Description)
	s.Require().Equal(models.DtoCubeType("CIT_CUBE"), createRes2.Payload.Type)
	s.Require().Equal(testUserName, createRes2.Payload.Author)

	getCubes, err := s.c.Cube.GetAPIV1Cubes(&cube.GetAPIV1CubesParams{})
	s.Require().NoError(err)
	s.Require().NotNil(getCubes)
	s.Require().NotNil(getCubes.Payload)
	s.Require().Equal(2, len(getCubes.Payload.Cubes))
	// trying create third cube with name of the second cube
	_, err = s.c.Cube.PostAPIV1CubeSystem(&cube.PostAPIV1CubeSystemParams{
		Request: &models2.RequestsCreateCubeRequest{
			Name: ptr("BTestCube"),
		},
	})

	s.Require().Error(err)
	s.Require().Contains(err.Error(), "[409]")

	// create third cube
	createRes3, err := s.c.Cube.PostAPIV1CubeSystem(&cube.PostAPIV1CubeSystemParams{
		Request: &models2.RequestsCreateCubeRequest{
			Name:        ptr("CTestCube"),
			Description: "test cube description 3",
			Type:        "CIT_NEW_TYPE",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(createRes3)
	s.Require().NotNil(createRes3.Payload)
	s.Require().Equal("CTestCube", createRes3.Payload.Name)
	s.Require().Equal("test cube description 3", createRes3.Payload.Description)
	s.Require().Equal(models.DtoCubeType("CIT_NEW_TYPE"), createRes3.Payload.Type)
	s.Require().Equal(testUserName, createRes3.Payload.Author)

	// select first and third cube
	listByIDRes, err := s.c.Cube.GetAPIV1CubesByIds(&cube.GetAPIV1CubesByIdsParams{
		Ids: []int64{createRes.Payload.ID, createRes3.Payload.ID},
	})

	s.Require().NoError(err)
	s.Require().NotNil(listByIDRes)
	s.Require().NotNil(listByIDRes.Payload)
	s.Require().Len(listByIDRes.Payload.Cubes, 2)
	s.Require().True(slices.ContainsFunc(listByIDRes.Payload.Cubes, func(c *models2.DtoCube) bool {
		return c.ID == createRes.Payload.ID
	}))
	s.Require().True(slices.ContainsFunc(listByIDRes.Payload.Cubes, func(c *models2.DtoCube) bool {
		return c.ID == createRes3.Payload.ID
	}))
}
