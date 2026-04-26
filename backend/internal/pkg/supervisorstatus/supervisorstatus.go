package supervisorstatus

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// WireExperimentStatus отражает JSON ответа GET /api/experiments/{id}/status Java-супервизора.
type WireExperimentStatus struct {
	ExperimentID          int64                     `json:"experimentId"`
	CurrentModel          string                    `json:"currentModel"`
	CurrentOrder          int                       `json:"currentOrder"`
	TotalModels           int                       `json:"totalModels"`
	Status                string                    `json:"status"`
	LastUpdated           json.RawMessage              `json:"lastUpdated"`
	ModelStatuses         map[string]WireModelState    `json:"modelStatuses"`
	Detail                string                       `json:"detail"`
	CancellationRequested bool                         `json:"cancellationRequested"`
}

// WireModelState соответствует вложенному modelStatuses в ответе супервизора.
type WireModelState struct {
	ModelName    string          `json:"modelName"`
	Status       string          `json:"status"`
	StartTime    json.RawMessage `json:"startTime"`
	EndTime      json.RawMessage `json:"endTime"`
	ErrorMessage string          `json:"errorMessage"`
}

// Fetch выполняет GET {baseURL}/api/experiments/{experimentID}/status.
func Fetch(ctx context.Context, baseURL string, experimentID int64) (*WireExperimentStatus, int, error) {
	base := strings.TrimRight(strings.TrimSpace(baseURL), "/")
	u := fmt.Sprintf("%s/api/experiments/%d/status", base, experimentID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, 0, err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return nil, resp.StatusCode, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, resp.StatusCode, fmt.Errorf("supervisor HTTP %d: %s", resp.StatusCode, bytes.TrimSpace(body))
	}
	var st WireExperimentStatus
	if err := json.Unmarshal(body, &st); err != nil {
		return nil, resp.StatusCode, err
	}
	return &st, resp.StatusCode, nil
}
