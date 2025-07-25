package main

import (
	"encoding/json"
	"fmt"
	fmannotator "github.com/OrcaBus/service-fmannotator/app"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-secretsmanager-caching-go/secretcache"
	"log/slog"
)

var (
	secretCache, _ = secretcache.New()
)

// Handler for the portalRunId annotator function.
func Handler(event events.SQSEvent) error {
	config, token, err := fmannotator.LoadCachedConfig(secretCache)
	if err != nil {
		return err
	}

	for _, record := range event.Records {
		body := record.Body
		slog.Debug(fmt.Sprintf("processing record: %v", body))

		var workflowRunEvent fmannotator.Event
		err = json.Unmarshal([]byte(body), &workflowRunEvent)
		if err != nil {
			return err
		}
		slog.Debug(fmt.Sprintf("unmarshalled event: %v", workflowRunEvent))

		err = fmannotator.PortalRunId(workflowRunEvent, config, token)
		if err != nil {
			return err
		}
	}

	return nil
}

func main() {
	lambda.Start(Handler)
}
