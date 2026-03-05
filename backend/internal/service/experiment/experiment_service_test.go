package service

import (
	"cmp"
	"context"
	"encoding/json"
	"slices"
	"testing"

	"github.com/stretchr/testify/require"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	dbmock "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/mocks/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	"go.uber.org/mock/gomock"
)

func CreateGraphConfigWithCubes(cubesConfig string) models.GraphConfig {
	cubes := []any{}
	if err := json.Unmarshal([]byte(cubesConfig), &cubes); err != nil {
		panic(err)
	}

	return models.GraphConfig{
		Cubes: cubes,
	}
}

func TestExperimentGetCubesOptionsNames(t *testing.T) {
	type fields struct {
		cubesConfigJson string
	}
	type args struct {
		workerConfig *models.Worker
	}

	prepareWorkerConfig := func(f *fields, a *args) {
		a.workerConfig = &models.Worker{
			GraphConfig: CreateGraphConfigWithCubes(f.cubesConfigJson),
		}
	}

	tests := []struct {
		name    string
		fields  fields
		args    args
		want    map[string][]string
		prepare func(f *fields, a *args)
	}{
		{
			name: "SuccessExtractOneOptionPerCube",
			fields: fields{
				cubesConfigJson: `
[
	{
		"Name": "Cube1",
		"InputsMapping": {
		},
		"OutputNames": [],
		"QYTInsertOptions": {
		}
	},
	{
		"Name": "Cube2",
		"InputsMapping": {
		},
		"OutputNames": [],
		"Concat": {
		}
	},
	{
		"Name": "Cube3",
		"InputsMapping": {
		},
		"OutputNames": [],
		"ConcatWithDelay": {
		}
	}
]
				`,
			},
			want: map[string][]string{
				"Cube1": {"QYTInsertOptions"},
				"Cube2": {"Concat"},
				"Cube3": {"ConcatWithDelay"},
			},
			prepare: prepareWorkerConfig,
		},
		{
			name: "SuccessExtractSeveralOptionPerCube",
			fields: fields{
				cubesConfigJson: `
[
	{
		"Name": "Cube1",
		"InputsMapping": {
		},
		"OutputNames": [],
		"QYTInsertOptions": {
		},
		"SomeNewOption": [
		]
	},
	{
		"Name": "Cube2",
		"InputsMapping": {
		},
		"OutputNames": [],
		"Concat": {
		},
		"AnotherOption": {
		}
	},
	{
		"Name": "Cube3",
		"InputsMapping": {
		},
		"OutputNames": [],
		"ConcatWithDelay": {
		},
		"AnotherOption": {
		}
	}
]
			`,
			},
			want: map[string][]string{
				"Cube1": {"QYTInsertOptions", "SomeNewOption"},
				"Cube2": {"Concat", "AnotherOption"},
				"Cube3": {"ConcatWithDelay", "AnotherOption"},
			},
			prepare: prepareWorkerConfig,
		},
		{
			name: "NoCubes",
			fields: fields{
				cubesConfigJson: `[]`,
			},
			want:    map[string][]string{},
			prepare: prepareWorkerConfig,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.prepare(&tt.fields, &tt.args)
			cubeKeysMap := getExperimentCubesOptionsNames(tt.args.workerConfig)

			require.Equal(t, len(tt.want), len(cubeKeysMap))
			for key, vals := range tt.want {
				cubeKeys, ok := cubeKeysMap[key]
				require.True(t, ok)

				slices.Sort(cubeKeys)
				slices.Sort(vals)
				require.Equal(t, cubeKeys, vals)
			}
		})
	}
}

func TestExperimentEnrichExperimentConfig(t *testing.T) {
	type fields struct {
	}
	type args struct {
		paramsName2CubeID map[string]int32
		cubeKeysMap       map[string][]string
		ppAditionalInfo   string
	}

	correctAddInfoJson := func(j string) (string, error) {
		addInfoData := map[string]any{}
		err := json.Unmarshal([]byte(j), &addInfoData)
		if err != nil {
			return "", err
		}

		cubes, _ := addInfoData["Cubes"].([]any)
		slices.SortFunc(cubes, func(lhs, rhs any) int {
			lhsD, _ := lhs.(map[string]any)
			rhsD, _ := rhs.(map[string]any)

			lhsName, _ := lhsD["Name"].(string)
			rhsName, _ := rhsD["Name"].(string)

			return cmp.Compare(lhsName, rhsName)
		})

		addInfoData["Cubes"] = cubes
		res, err := json.Marshal(addInfoData)
		return string(res), err
	}

	tests := []struct {
		name   string
		fields fields
		args   args
		want   string
	}{
		{
			name:   "SuccessGenerateAddInfoForAllCubes",
			fields: fields{},
			args: args{
				paramsName2CubeID: map[string]int32{
					"QYTInsertOptions": 4,
					"Concat":           5,
					"ConcatWithDelay":  6,
				},
				cubeKeysMap: map[string][]string{
					"Cube1": {"QYTInsertOptions"},
					"Cube2": {"Concat"},
					"Cube3": {"ConcatWithDelay"},
				},
				ppAditionalInfo: "",
			},
			want: `
			{
				"Cubes": [
					{
						"Name": "Cube1",
						"CubeTypeID": 4
					},
					{
						"Name": "Cube2",
						"CubeTypeID": 5
					},
					{
						"Name": "Cube3",
						"CubeTypeID": 6
					}
				]
			}
			`,
		},
		{
			name:   "SuccessGenerateAddInfoForAllCubesNoChangeAddInfo",
			fields: fields{},
			args: args{
				paramsName2CubeID: map[string]int32{
					"QYTInsertOptions": 4,
					"ConcatWithDelay":  6,
				},
				cubeKeysMap: map[string][]string{
					"Cube1": {"QYTInsertOptions"},
					"Cube2": {"Concat"},
					"Cube3": {"ConcatWithDelay"},
				},
				ppAditionalInfo: `
				{
					"AnotherOptions": {
						"Key": "Value"
					},
					"Cubes":[
					]
				}
				`,
			},
			want: `
			{
				"AnotherOptions": {
					"Key": "Value"
				},
				"Cubes": [
					{
						"Name": "Cube1",
						"CubeTypeID": 4
					},
					{
						"Name": "Cube3",
						"CubeTypeID": 6
					}
				]
			}
			`,
		},
		{
			name:   "SuccessGenerateAddInfoForAllCubesNoChangeExistCube",
			fields: fields{},
			args: args{
				paramsName2CubeID: map[string]int32{
					"QYTInsertOptions": 4,
					"ConcatWithDelay":  6,
				},
				cubeKeysMap: map[string][]string{
					"Cube1": {"QYTInsertOptions"},
					"Cube3": {"ConcatWithDelay"},
				},
				ppAditionalInfo: `
				{
					"AnotherOptions": {
						"Key": "Value"
					},
					"Cubes":[
						{
							"SomeOption": 321,
							"Name": "Cube2",
							"CubeTypeID": 5
						}
					]
				}
				`,
			},
			want: `
			{
				"AnotherOptions": {
					"Key": "Value"
				},
				"Cubes": [
					{
						"Name": "Cube1",
						"CubeTypeID": 4
					},
					{
						"SomeOption": 321,
						"Name": "Cube2",
						"CubeTypeID": 5
					},
					{
						"Name": "Cube3",
						"CubeTypeID": 6
					}
				]
			}
			`,
		},
		{
			name:   "SuccessGenerateAddInfoForAllCubesUpdateExistsCube",
			fields: fields{},
			args: args{
				paramsName2CubeID: map[string]int32{
					"QYTInsertOptions": 4,
				},
				cubeKeysMap: map[string][]string{
					"Cube1": {"QYTInsertOptions"},
				},
				ppAditionalInfo: `
				{
					"AnotherOptions": {
						"Key": "Value"
					},
					"Cubes":[
						{
							"SomeOption": 123,
							"Name": "Cube1",
							"CubeTypeID": 1
						},
						{
							"SomeOption": 321,
							"Name": "Cube2",
							"CubeTypeID": 5
						}
					]
				}
				`,
			},
			want: `
			{
				"AnotherOptions": {
					"Key": "Value"
				},
				"Cubes": [
					{
						"SomeOption": 123,
						"Name": "Cube1",
						"CubeTypeID": 4
					},
					{
						"SomeOption": 321,
						"Name": "Cube2",
						"CubeTypeID": 5
					}
				]
			}
			`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			updateAddInfo := addCubeIdToExperimentAddInfoByCubesKeys(tt.args.paramsName2CubeID, tt.args.cubeKeysMap, tt.args.ppAditionalInfo)
			correctedAddInfo, err := correctAddInfoJson(updateAddInfo)
			require.NoError(t, err)

			correctedWant, err := correctAddInfoJson(tt.want)
			require.NoError(t, err)

			require.JSONEq(t, correctedWant, correctedAddInfo)
		})
	}
}

func NewTestService(db db.DB) *ExperimentService {
	l, err := logger.NewLogger(nil)
	if err != nil {
		panic(err)
	}
	return &ExperimentService{
		repo: &repository.Repository{
			Logger:  l,
			DB:      db,
			Version: "test",
		},
	}
}

func TestUpdateAdditionalInformation(t *testing.T) {
	type fields struct {
		ctrl    *gomock.Controller
		ps      *ExperimentService
		cubesDB []dbcore.SelectCubesByParamsNamesRow
	}
	type args struct {
		ctx             context.Context
		experimentConfig  string
		experimentAddInfo string
	}
	correctAddInfoJson := func(j string) (string, error) {
		addInfoData := map[string]any{}
		err := json.Unmarshal([]byte(j), &addInfoData)
		if err != nil {
			return "", err
		}

		cubes, _ := addInfoData["Cubes"].([]any)
		slices.SortFunc(cubes, func(lhs, rhs any) int {
			lhsD, _ := lhs.(map[string]any)
			rhsD, _ := rhs.(map[string]any)

			lhsName, _ := lhsD["Name"].(string)
			rhsName, _ := rhsD["Name"].(string)

			return cmp.Compare(lhsName, rhsName)
		})

		addInfoData["Cubes"] = cubes
		res, err := json.Marshal(addInfoData)
		return string(res), err
	}
	tests := []struct {
		name    string
		args    args
		fields  fields
		want    string
		wantErr bool
		prepare func(*fields, *args)
	}{
		{
			name: "SuccessCreateAddInfo",
			fields: fields{
				cubesDB: []dbcore.SelectCubesByParamsNamesRow{
					{ID: 1, Name: "Cube1", ParamsName: "Cube1Option"},
					{ID: 2, Name: "Cube2", ParamsName: "Cube2Option"},
					{ID: 3, Name: "Cube3", ParamsName: "Cube3Option"},
				},
			},
			args: args{
				ctx: context.Background(),
				experimentConfig: `
				{
					"Worker": {
						"GraphConfig": {
							"Cubes": [
								{	
									"Name": "FirstCube",
									"Cube2Option": {
									}
								},
								{	
									"Name": "SecondCube",
									"Cube3Option": {
									}
								},
								{	
									"Name": "ThirdCube",
									"Cube1Option": {
									}
								}
							]
						}
					}
				}`,
				experimentAddInfo: "",
			},
			want: `
			{
				"Cubes": [
					{
						"Name": "FirstCube",
						"CubeTypeID": 2
					},
					{
						"Name": "SecondCube",
						"CubeTypeID": 3
					},
					{
						"Name": "ThirdCube",
						"CubeTypeID": 1
					}
				]
			}`,
			prepare: func(f *fields, a *args) {
				f.ctrl = gomock.NewController(t)
				db := dbmock.NewMockDB(f.ctrl)
				db.EXPECT().SelectCubesByParamsNames(
					a.ctx,
					gomock.InAnyOrder([]string{"Cube2Option", "Cube3Option", "Cube1Option"}),
				).Return(f.cubesDB, nil)
				f.ps = NewTestService(db)
			},
		},
		{
			name: "SuccessCreateAddInfoNotAllCubes",
			fields: fields{
				cubesDB: []dbcore.SelectCubesByParamsNamesRow{
					{ID: 1, Name: "Cube1", ParamsName: "Cube1Option"},
					{ID: 3, Name: "Cube3", ParamsName: "Cube3Option"},
				},
			},
			args: args{
				ctx: context.Background(),
				experimentConfig: `
				{
					"Worker": {
						"GraphConfig": {
							"Cubes": [
								{	
									"Name": "FirstCube",
									"Cube2Option": {
									}
								},
								{	
									"Name": "SecondCube",
									"Cube3Option": {
									}
								},
								{	
									"Name": "ThirdCube",
									"Cube1Option": {
									}
								}
							]
						}
					}
				}`,
				experimentAddInfo: "",
			},
			want: `
			{
				"Cubes": [
					{
						"Name": "SecondCube",
						"CubeTypeID": 3
					},
					{
						"Name": "ThirdCube",
						"CubeTypeID": 1
					}
				]
			}`,
			prepare: func(f *fields, a *args) {
				f.ctrl = gomock.NewController(t)
				db := dbmock.NewMockDB(f.ctrl)
				db.EXPECT().SelectCubesByParamsNames(
					a.ctx,
					gomock.InAnyOrder([]string{"Cube2Option", "Cube3Option", "Cube1Option"}),
				).Return(f.cubesDB, nil)
				f.ps = NewTestService(db)
			},
		},
		{
			name: "SuccessNoCubesAddInfoWithNoCubes",
			fields: fields{
				cubesDB: []dbcore.SelectCubesByParamsNamesRow{},
			},
			args: args{
				ctx: context.Background(),
				experimentConfig: `
				{
					"Worker": {
						"GraphConfig": {
							"Cubes": []
						}
					}
				}`,
				experimentAddInfo: `{"SomeOptions": 123}`,
			},
			want: `{"SomeOptions": 123, "Cubes":[]}`,
			prepare: func(f *fields, a *args) {
				f.ctrl = gomock.NewController(t)
				db := dbmock.NewMockDB(f.ctrl)
				db.EXPECT().SelectCubesByParamsNames(
					a.ctx,
					gomock.InAnyOrder([]string{}),
				).Return(f.cubesDB, nil)
				f.ps = NewTestService(db)
			},
		},
		{
			name: "SuccessNoCubesAddInfoNoWorker",
			fields: fields{
				cubesDB: []dbcore.SelectCubesByParamsNamesRow{},
			},
			args: args{
				ctx:             context.Background(),
				experimentConfig:  `{}`,
				experimentAddInfo: `{"SomeOptions": 123}`,
			},
			want: `{"SomeOptions": 123}`,
			prepare: func(f *fields, a *args) {
				f.ctrl = gomock.NewController(t)
				db := dbmock.NewMockDB(f.ctrl)
				f.ps = NewTestService(db)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.prepare(&tt.fields, &tt.args)
			resAddInfo, err := tt.fields.ps.updateAdditionalCubeInformation(tt.args.ctx, tt.args.experimentConfig, tt.args.experimentAddInfo)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
			correctResAddInfo, err := correctAddInfoJson(resAddInfo)
			require.NoError(t, err)
			correctWantAddInfo, err := correctAddInfoJson(tt.want)
			require.NoError(t, err)
			require.JSONEq(t, correctWantAddInfo, correctResAddInfo)
		})
	}
}
