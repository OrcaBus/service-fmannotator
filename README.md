# FMAnnotator

The FMAnnotator is responsible for tagging [filemanager] records with attributes based on events received from the main
OrcaBus event bus. Currently the only use-case is to tag filemanager records with a `portalRunId` based on `WorkflowStateChange`
events.

## Development

The Go app is located inside [`app`][app], see the [README][readme] for more details.

The [`infrastructure`][infrastructure] directory contains an AWS CDK deployment of filemanager, and automated CI/CD pipelines. The
[`bin`][bin] directory contains the entrypoint for the CDK app, and [`test`][test] contains infrastructure tests.

Both [`app`][app] and the top-level project contain Makefiles for local development that can be used to build, install
and lint code.

This project uses [pnpm] for development, for example, after running `pnpm install`, the CodePipeline stack can be deployed
by running `pnpm cdk-stateless deploy -e OrcaBusStatelessFMAnnotatorStack` or `pnpm cdk-stateful deploy -e OrcaBusStatefulFMAnnotatorStack`.

[readme]: app/README.md
[app]: app
[bin]: bin
[infrastructure]: infrastructure
[test]: test
[api]: app/docs/API_GUIDE.md
[architecture]: app/docs/ARCHITECTURE.md
[pnpm]: https://pnpm.io/
[filemanager]: https://github.com/OrcaBus/service-filemanager
