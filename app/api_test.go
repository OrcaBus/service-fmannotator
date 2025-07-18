package fmannotator

import (
	"bytes"
	"encoding/json"
	"github.com/OrcaBus/service-fmannotator/app/internal/test"
	"github.com/stretchr/testify/require"
	"net/url"
	"testing"
)

func TestMarshallPortalRunId(t *testing.T) {
	b := test.CreateEvent(t, "event_succeeded.json")
	var event Event
	err := json.Unmarshal(b, &event)
	require.NoError(t, err)

	body, err := MarshallPortalRunId(&event)
	require.NoError(t, err)

	var patch PatchList
	err = json.Unmarshal(body, &patch)
	require.NoError(t, err)

	require.Equal(t, PatchList{JsonPatch{
		"add",
		"/portalRunId",
		"202409021221e6e6",
	}}, patch)
}

func TestApiBuild(t *testing.T) {
	config := Config{
		"http://localhost:8000",
		"token",
		"queue",
	}

	api, err := NewApiClient(&config, bytes.NewBuffer([]byte{}))
	require.NoError(t, err)

	api = api.WithMethod("PATCH").WithS3Endpoint().WithQuery(url.Values{
		"key": {"value"},
	}).WithHeader("Content-Type", "application/json")

	require.Equal(t, []string{"application/json"}, api.Request.Header.Values("Content-Type"))
	require.Equal(t, "PATCH", api.Request.Method)
	require.Equal(t, "localhost:8000", api.Request.URL.Host)
	require.Equal(t, "/api/v1/s3", api.Request.URL.Path)
	require.Equal(t, "key=value", api.Request.URL.RawQuery)
}
