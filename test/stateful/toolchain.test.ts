import { App } from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { StatefulStack } from '../../infrastructure/toolchain/stateful-stack';
import { cdkNagStack } from '../util';

describe('cdk-nag-stateful-toolchain-stack', () => {
  const app = new App({});

  const statefulStack = new StatefulStack(app, 'StatefulStack', {
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  cdkNagStack(statefulStack, (stack) => {
    NagSuppressions.addStackSuppressions(stack, [
      { id: 'AwsSolutions-IAM5', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-S1', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-KMS5', reason: 'Allow CDK Pipeline' },
    ]);
  });
});
