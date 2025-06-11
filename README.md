FMAnnotator
--------------------------------------------------------------------------------

The FMAnnotator is a service that responds to `WorkflowRunStateChange` events and adds attributes to [filemanager] records.
It is responsible for tagging [filemanager] records with attributes based on events received from the main
OrcaBus event bus. Currently, the only use-case is to tag filemanager records with a `portalRunId` found inside
the `WorkflowStateChange` event.

To do this, it reads the events and then tags all filemanager records that contain the `portalRunId` in the path, that
is, it tags records with `*/<portalRunId>/*` inside the `key` column. This service does not have any API endpoints.

### Consumed Events

| Name / DetailType        | Source                                        | Schema Link                                                                                                                         | Description                                                    |
|--------------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `WorkflowRunStateChange` | [`orcabus.workflowmanager`][workflow-manager] | https://github.com/OrcaBus/service-workflow-manager/blob/main/docs/events/WorkflowRunStateChange/WorkflowRunStateChange.schema.json | Announces service state changes and contains the `portalRunId` |

[workflow-manager]: https://github.com/OrcaBus/service-workflow-manager

### Permissions & Access Control

The FMAnnotator needs permissions to push to the dead-letter SQS queue and read the OrcaBus `orcabus/token-service-jwt` API secret.

### Change Management

This service employs a fully automated CI/CD pipeline that automatically builds and releases all changes to the `main`
code branch.

There are no automated changelogs or releases, however semantic versioning is followed for any manual release, and
[conventional commits][conventional-commits] are used for future automation.

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/

Infrastructure & Deployment
--------------------------------------------------------------------------------

The FMAnnotator is a primarily a stateless service that consumes events on the event bus, however it does have a stateful
dead-letter queue that it uses to push events that could not be processed.

It uses a [`GoFunction`][go-function] as the Lambda function that responds to events on the OrcaBus main event bus. It
also deploys an event rule to the event bus to filter the correct events that the service should respond to.

[go-function]: https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-lambda-go-alpha.GoFunction.html

### CDK Commands

You can access CDK commands using the `pnpm` wrapper script.

- **`cdk-stateless`**: Used to deploy the FMAnnotator `GoFunction` and event rules for the event bus.
- **`cdk-stateful`**: Used to deploy the FMAnnotator dead-letter SQS queue for failed events.

The type of stack to deploy is determined by the context set in the `./bin/deploy.ts` file. This ensures the correct stack is executed based on the provided context.

For example:

```sh
# Deploy a stateless stack
pnpm cdk-stateless <command>
```

```sh
# Deploy a stateful stack
pnpm cdk-stateful <command>
```

### Stacks

This CDK project manages multiple stacks. The root stack (the only one that does not include `DeploymentPipeline` in its stack ID)
is deployed in the toolchain account and sets up a CodePipeline for cross-environment deployments to `beta`, `gamma`, and `prod`.

To list all available stacks, run the `cdk-stateless` or `cdk-stateful` script:

```sh
pnpm cdk-stateless ls
```

Output:

```sh
OrcaBusStatelessFMAnnotatorStack
OrcaBusStatelessFMAnnotatorStack/DeploymentPipeline/OrcaBusBeta/FMAnnotatorStack (OrcaBusBeta-FMAnnotatorStack)
OrcaBusStatelessFMAnnotatorStack/DeploymentPipeline/OrcaBusGamma/FMAnnotatorStack (OrcaBusGamma-FMAnnotatorStack)
OrcaBusStatelessFMAnnotatorStack/DeploymentPipeline/OrcaBusProd/FMAnnotatorStack (OrcaBusProd-FMAnnotatorStack)
```

Development
--------------------------------------------------------------------------------

### Project Structure

The root of the project is an AWS CDK project and the main application logic lives inside the `./app` folder.

The project is organized into the following directories:

- **`./app`**: Contains the main application logic written in Go.

- **`./bin/deploy.ts`**: Serves as the entry point of the application. It initializes two stacks: `stateless` and `stateful`.

- **`./infrastructure`**: Contains the infrastructure code for the project:
    - **`./infrastructure/toolchain`**: Includes stacks for the stateless and stateful resources deployed in the toolchain account. These stacks primarily set up the CodePipeline for cross-environment deployments.
    - **`./infrastructure/stage`**: Defines the stage stacks for different environments:
        - **`./infrastructure/stage/config.ts`**: Contains environment-specific configuration files (e.g., `beta`, `gamma`, `prod`).
        - **`./infrastructure/stage/fmannotator-stack.ts`**: The CDK stack entry point for provisioning resources required by the application in `./app`.

- **`.github/workflows/pr-tests.yml`**: Configures GitHub Actions to run tests for `make check-all` (linting and code style), tests defined in `./test`, and `make test` for the `./app` directory.

- **`./test`**: Contains tests for CDK code compliance against `cdk-nag`.

### Setup

#### Requirements

This project requires Go for development. It's recommended for it to be installed to make use of local bundling,
however to just deploy the stack, all that should be required is pnpm and nodejs:

```sh
node --version
v22.9.0

# Update Corepack (if necessary, as per pnpm documentation)
npm install --global corepack@latest

# Enable Corepack to use pnpm
corepack enable pnpm
```

#### Install Dependencies

To install pnpm dependencies, run:

```sh
make install
```

### Conventions

A top-level [`Makefile`][makefile] contains commands to install, build, lint and test code. See the [`Makefile`][makefile-app] in the [`app`][app] directory
for commands to run lints against the application code. There are links to the app `Makefile` in the top-level `Makefile`.

### Linting & Formatting

Automated checks are enforced via pre-commit hooks, ensuring only checked code is committed. For details consult the `.pre-commit-config.yaml` file.

To run linting and formatting checks on the whole project (this requires [Go][go] and [golangci-lint][golangci-lint]), use:

```sh
make check-all
```

To automatically fix issues with ESLint and Prettier, run:

```sh
make fix
```

### Testing

Tests for the application are contained in the `app` directory. Infrastructure and cdk-nag tests can be run by using:

```sh
make test
```

[makefile]: Makefile
[makefile-app]: app/Makefile
[readme]: app/README.md
[app]: app
[bin]: bin
[infrastructure]: infrastructure
[test]: test
[pnpm]: https://pnpm.io/
[filemanager]: https://github.com/OrcaBus/service-filemanager
[golang]: https://go.dev/doc/install
[golangci-lint]: https://golangci-lint.run/welcome/install/#local-installation
