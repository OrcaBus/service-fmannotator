package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-secretsmanager-caching-go/secretcache"
	"github.com/umccr/orcabus/lib/workload/stateless/stacks/fmannotator"
	"github.com/umccr/orcabus/lib/workload/stateless/stacks/fmannotator/schema/orcabus_workflowmanager/workflowrunstatechange"
)

var (
	secretCache, _ = secretcache.New()
)

// Handler for the portalRunId annotator function.
func Handler(event workflowrunstatechange.Event) error {
	config, token, err := fmannotator.LoadCachedConfig(secretCache)
	if err != nil {
		return err
	}

	return fmannotator.PortalRunId(event, config, token)
}

func main() {
	lambda.Start(Handler)
}
