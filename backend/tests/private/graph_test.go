package private

import (
	"github.com/stretchr/testify/require"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestProjectGraph() {
	t := s.T()

	nsResp, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-gph"),
		},
		Context: s.ctx,
	})

	require.NoError(t, err)
	require.NotNil(t, nsResp.Payload.ID)
	namespaceID := nsResp.Payload.ID
	s.grantNamespace(namespaceID)

	projResp, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-graph"),
			NamespaceID:  &namespaceID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	require.NoError(t, err)
	require.NotNil(t, projResp.Payload.ID)
	projectID := projResp.Payload.ID

	experimentIDs := make([]int32, 0, 3)
	experimentNames := []string{"experiment-1", "experiment-2", "experiment-3"}

	for _, name := range experimentNames {
		pipeResp, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
			Request: &models2.RequestsCreateCompleteExperimentRequest{
				Name:      ptr(name),
				ProjectID: &projectID,
			},
			Context: s.ctx,
		})
		require.NoError(t, err)
		require.NotNil(t, pipeResp.Payload.ID)
		experimentIDs = append(experimentIDs, int32(pipeResp.Payload.ID))
	}

	graphResp, err := s.c.Experiment.GetAPIV1Graph(&experiment2.GetAPIV1GraphParams{
		ProjectID: projectID,
		Context:   s.ctx,
	})
	require.NoError(t, err)
	require.NotNil(t, graphResp.Payload.Graph)
	require.NotNil(t, graphResp.Payload.Graph.Nodes)

	require.Len(t, graphResp.Payload.Graph.Nodes, len(experimentNames))

	experimentMap := make(map[int32]string)
	for i, id := range experimentIDs {
		experimentMap[id] = experimentNames[i]
	}

	for _, node := range graphResp.Payload.Graph.Nodes {
		require.Equal(t, "experiment", string(node.Type))
		require.Contains(t, experimentMap, int32(node.ID))
		require.Equal(t, experimentMap[int32(node.ID)], node.Name)
		require.Equal(t, "OK", string(node.Status))
	}
}
