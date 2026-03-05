package shared

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func TestParseRequest(t *testing.T) {
	type Req struct {
		A        int     `json:"a"`
		B        string  `json:"b"`
		C        *string `json:"c,omitempty"`
		D        *string `json:"d,omitempty"`
		ParamKey string
	}
	met := map[string]string{
		"key1": "val1",
		"key2": "val2",
		"key3": "val3",
	}
	setP := func(req *Req, key, value string) *responses.ErrorResponse {
		// check that ParseRequest uses each key exactly once
		v, ok := met[key]
		require.True(t, ok)
		require.Equal(t, v, value)
		delete(met, key)

		// check that ParseRequest changes value
		req.ParamKey = "idle_param"
		return nil
	}

	dVal := "dval"
	r := Req{
		A: 33,
		B: "aboba",
		C: nil,
		D: &dVal,
	}
	rBin, err := json.Marshal(r)
	require.NoError(t, err)

	req, err := http.NewRequest(http.MethodPost, "https://help.me/im/being/held/hostage?key1=val1&key2=val2&key3=val3", bytes.NewReader(rBin))
	require.NoError(t, err)

	res, errP := ParseRequest(req, setP, "key1", "key2", "key3")
	require.Nil(t, errP)
	require.NotNil(t, res.D)

	require.NotNil(t, res)
	require.Equal(t, 33, res.A)
	require.Equal(t, "aboba", res.B)
	require.Equal(t, (*string)(nil), res.C)
	require.Equal(t, "dval", *res.D)
	require.Equal(t, "idle_param", res.ParamKey)

	require.Empty(t, met)
}

// TODO: test response marshalling
