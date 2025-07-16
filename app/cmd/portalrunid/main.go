package main

import (
	fmannotator "github.com/OrcaBus/service-fmannotator/app"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-secretsmanager-caching-go/secretcache"
)

var (
	secretCache, _ = secretcache.New()
)

// Handler for the portalRunId annotator function.
func Handler(event fmannotator.Event) error {
	config, token, err := fmannotator.LoadCachedConfig(secretCache)
	if err != nil {
		return err
	}

	return fmannotator.PortalRunId(event, config, token)
}

func main() {
	lambda.Start(Handler)
}
