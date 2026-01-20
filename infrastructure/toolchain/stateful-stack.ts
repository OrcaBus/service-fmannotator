import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentStackPipeline } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';
import { getFmAnnotatorStatefulProps } from '../stage/config';
import { Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { FMAnnotatorStatefulStack } from '../stage/fmannotator-stateful-stack';

export class StatefulStack extends cdk.Stack {
  readonly pipeline: Pipeline;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const installCommands = [
      'npm install --global corepack@latest',
      'corepack enable',
      'pnpm install --frozen-lockfile --ignore-scripts',
    ];
    const deployment = new DeploymentStackPipeline(this, 'DeploymentPipeline', {
      githubBranch: 'main',
      githubRepo: 'service-fmannotator',
      stack: FMAnnotatorStatefulStack,
      stackName: 'FMAnnotatorStatefulStack',
      stackConfig: {
        beta: getFmAnnotatorStatefulProps(),
        gamma: getFmAnnotatorStatefulProps(),
        prod: getFmAnnotatorStatefulProps(),
      },
      pipelineName: 'OrcaBus-StatefulFMAnnotator',
      cdkSynthCmd: [...installCommands, 'pnpm cdk-stateful synth'],
      // No app tests for stateful stack.
      unitAppTestConfig: {
        command: [],
      },
      unitIacTestConfig: {
        command: [...installCommands, 'pnpm test-stateful'],
      },
    });

    this.pipeline = deployment.pipeline;
  }
}
