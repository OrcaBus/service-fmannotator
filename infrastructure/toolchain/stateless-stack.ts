import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentStackPipeline } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';
import { Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { FMAnnotatorStack } from '../stage/fmannotator-stateless-stack';
import { getFmAnnotatorProps } from '../stage/config';

export class StatelessStack extends cdk.Stack {
  readonly pipeline: Pipeline;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deployment = new DeploymentStackPipeline(this, 'DeploymentPipeline', {
      githubBranch: 'main',
      githubRepo: 'service-fmannotator',
      stack: FMAnnotatorStack,
      stackName: 'FMAnnotatorStack',
      stackConfig: {
        beta: {
          ...getFmAnnotatorProps(),
        },
        gamma: {
          ...getFmAnnotatorProps(),
        },
        prod: {
          ...getFmAnnotatorProps(),
        },
      },
      pipelineName: 'OrcaBus-StatelessFMAnnotator',
      cdkSynthCmd: ['pnpm install --frozen-lockfile --ignore-scripts', 'pnpm cdk-stateless synth'],
      synthBuildSpec: {
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '22.x',
              golang: '1.24',
            },
          },
        },
      },
    });

    this.pipeline = deployment.pipeline;
  }
}
