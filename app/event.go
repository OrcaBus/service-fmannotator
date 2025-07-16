// Package fmannotator event definitions that the Lambda function recognises.
package fmannotator

// Event The event type that the fmannotator can consume. This omits details that do not need to be deserialized
// to maximise the flexibility.
type Event struct {
	Detail WorkflowRunStateChange `json:"detail,omitempty"`
}

// WorkflowRunStateChange The workflow run state change type definition. The fmannotator only needs access to
// the `PortalRunId` and `Status`.
type WorkflowRunStateChange struct {
	PortalRunId string `json:"portalRunId,omitempty"`
	Status      string `json:"status,omitempty"`
}
